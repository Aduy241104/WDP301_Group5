// controllers/recommend.controller.js
import mongoose from "mongoose";
import { Product } from "../models/Product.js";
import { UserProductEvent } from "../models/UserProductEvent.js";

const { Types } = mongoose;

const BASE_MATCH = {
    status: "approved",
    activeStatus: "active",
    isDeleted: false,
};

/** ---------------------------
 *  Top categories: USER (từ event)
 *  --------------------------*/
export async function getTopCategoriesForUser(userId, topN = 3) {
    const uid = new Types.ObjectId(userId);
    const WEIGHTS = { view_detail: 1, wishlist: 3, add_to_cart: 5 };

    return UserProductEvent.aggregate([
        { $match: { userId: uid, categorySchemaId: { $ne: null } } },
        {
            $addFields: {
                score: {
                    $switch: {
                        branches: [
                            { case: { $eq: ["$eventType", "view_detail"] }, then: WEIGHTS.view_detail },
                            { case: { $eq: ["$eventType", "wishlist"] }, then: WEIGHTS.wishlist },
                            { case: { $eq: ["$eventType", "add_to_cart"] }, then: WEIGHTS.add_to_cart },
                        ],
                        default: 0,
                    },
                },
            },
        },
        {
            $group: {
                _id: "$categorySchemaId",
                score: { $sum: "$score" },
                lastAt: { $max: "$createdAt" },
            },
        },
        { $sort: { score: -1, lastAt: -1, _id: -1 } },
        { $limit: topN },

        {
            $lookup: {
                from: "categoryschemas",
                localField: "_id",
                foreignField: "_id",
                as: "category",
                pipeline: [{ $project: { _id: 1, name: 1 } }],
            },
        },
        { $unwind: "$category" },
        { $project: { _id: 0, categoryId: "$category._id", name: "$category.name", score: 1 } },
    ]);
}

/** ---------------------------
 *  Top categories: GUEST (từ Product)
 *  --------------------------*/
export async function getTopCategoriesForGuest(topN = 4) {
    return Product.aggregate([
        { $match: BASE_MATCH },
        {
            $group: {
                _id: "$categorySchemaId",
                totalSale: { $sum: "$totalSale" },
                count: { $sum: 1 },
            },
        },
        { $sort: { totalSale: -1, count: -1, _id: -1 } },
        { $limit: topN },
        {
            $lookup: {
                from: "categoryschemas",
                localField: "_id",
                foreignField: "_id",
                as: "category",
                pipeline: [{ $project: { _id: 1, name: 1 } }],
            },
        },
        { $unwind: "$category" },
        { $project: { _id: 0, categoryId: "$category._id", name: "$category.name", score: "$totalSale" } },
    ]);
}

/** ---------------------------
 *  Allocation rule theo yêu cầu:
 *  n=1 => 100%
 *  n=2 => 50/50
 *  n>=3 => chia đều gần đều
 *  --------------------------*/
function allocateByCount(total, n) {
    if (n <= 0) return [];
    if (n === 1) return [total];

    if (n === 2) {
        const a = Math.floor(total / 2);
        return [a, total - a];
    }

    const base = Math.floor(total / n);
    const rem = total - base * n;
    return Array.from({ length: n }, (_, i) => base + (i < rem ? 1 : 0));
}

/** ---------------------------
 *  Service chính (✅ có phân trang)
 *  --------------------------*/
export async function getRecommendedProductsService({ userId, limit = 8, page }) {
    const finalLimit = Math.min(Math.max(parseInt(limit || "30", 10), 1), 60);
    const currentPage = Math.max(parseInt(page || "1", 10), 1);
    const isGuest = !userId;
    
    // 1) Lấy top categories
    let categories = [];
    if (isGuest) {
        categories = await getTopCategoriesForGuest(4);
    } else {
        categories = await getTopCategoriesForUser(userId, 3);
    }

    // 2) Rule: user không có gì luôn => random toàn hệ thống
    const userNoData = !isGuest && categories.length === 0;

    // 3) Allocation theo số category thực tế
    const alloc = userNoData ? [finalLimit] : allocateByCount(finalLimit, categories.length);

    // 4) Query products theo từng nhóm (✅ skip theo page)
    let groups = [];
    let allItems = [];

    if (userNoData) {
        //RANDOM toàn hệ thống + phân trang
        const items = await Product.aggregate(
            buildCheckedProductPipeline({
                extraMatch: {},
                limit: finalLimit,
                skip: (currentPage - 1) * finalLimit,
                random: true,
            })
        );

        groups = [{ category: null, items }];
        allItems = [...items]
    } else {
        groups = await Promise.all(
            categories.map(async (c, idx) => {
                const catLimit = alloc[idx] || 0;

                if (catLimit <= 0) {
                    return { category: { _id: c.categoryId, name: c.name, score: c.score }, items: [] };
                }

                // phân trang theo từng category
                const skip = (currentPage - 1) * catLimit;

                const pipeline = buildCheckedProductPipeline({
                    extraMatch: { categorySchemaId: c.categoryId },
                    limit: catLimit,
                    skip,
                    random: isGuest, // guest: random trong từng category
                    sort: { totalSale: -1, updatedAt: -1, _id: -1 }, // user: hot trong category
                });

                const items = await Product.aggregate(pipeline);

                allItems = [...items, ...allItems];

                return {
                    category: { _id: c.categoryId, name: c.name, score: c.score },
                };
            })
        );
    }

    // hasNextPage: nếu có ít nhất 1 group trả đủ quota (tương đối)
    const hasNextPage = userNoData
        ? groups[0]?.items?.length === finalLimit
        : groups.some((g, idx) => (g.items?.length || 0) === (alloc[idx] || 0));

    return {
        ok: true,
        page: currentPage,
        limit: finalLimit,
        hasNextPage,
        mode: isGuest
            ? `guest_random_by_${categories.length || 0}_categories_paginated`
            : userNoData
                ? "user_no_event_random_paginated"
                : `user_behavior_by_${categories.length}_categories_paginated`,
        categories: groups,
        items: allItems
    };
}

function buildCheckedProductPipeline({
    extraMatch = {},
    sort = { totalSale: -1, updatedAt: -1, _id: -1 },
    limit = 10,
    skip = 0,
    random = false,
}) {
    const sortOrSampleStage = random ? { $sample: { size: limit + skip } } : { $sort: sort };

    return [
        { $match: { ...BASE_MATCH, ...extraMatch } },

        {
            $lookup: {
                from: "shops",
                localField: "shopId",
                foreignField: "_id",
                as: "shop",
                pipeline: [
                    {
                        $match: {
                            status: "approved",
                            isBlockedByAdmin: false,
                            isDeleted: false,
                        },
                    },
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            avatar: 1,
                            status: 1,
                        },
                    },
                ],
            },
        },
        { $unwind: "$shop" },

        {
            $lookup: {
                from: "variants",
                localField: "_id",
                foreignField: "productId",
                as: "variants",
                pipeline: [
                    { $match: { status: "active", isDeleted: false } },
                    { $project: { _id: 1 } },
                ],
            },
        },

        {
            $lookup: {
                from: "inventories",
                let: { variantIds: "$variants._id" },
                as: "inStocks",
                pipeline: [
                    { $match: { $expr: { $in: ["$variantId", "$$variantIds"] } } },
                    { $match: { stock: { $gt: 0 } } },
                    { $project: { _id: 1, variantId: 1, stock: 1 } },
                ],
            },
        },

        { $match: { $expr: { $gt: [{ $size: "$inStocks" }, 0] } } },

        sortOrSampleStage,

        ...(skip > 0 ? [{ $skip: skip }] : []),
        { $limit: limit },

        {
            $project: {
                _id: 1,
                shopId: 1,
                shopCategoryId: 1,
                brandId: 1,
                categorySchemaId: 1,
                name: 1,
                slug: 1,
                images: 1,
                defaultPrice: 1,
                ratingAvg: 1,
                totalSale: 1,
                shop: 1,
            },
        },
    ];
}
