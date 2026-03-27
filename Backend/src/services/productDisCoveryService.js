import { Product } from "../models/Product.js";
import mongoose from "mongoose";

export const getTopSale = async (skip, limit) => {
    const baseMatch = {
        status: "approved",
        activeStatus: "active",
        isDeleted: false,
    };

    const pipeline = [
        // 1) Lọc product đã duyệt + chưa xóa
        { $match: baseMatch },

        // 2) Join shop và đảm bảo shop còn hoạt động
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
        // Nếu shop không hợp lệ => loại
        { $unwind: "$shop" },

        // 3) Join variants active của product
        {
            $lookup: {
                from: "variants",
                localField: "_id",
                foreignField: "productId",
                as: "variants",
                pipeline: [
                    {
                        $match: {
                            status: "active",
                            isDeleted: false,
                        },
                    },
                    { $project: { _id: 1 } },
                ],
            },
        },

        // 4) Join inventory theo variantId, lọc stock > 0
        {
            $lookup: {
                from: "inventories",
                let: { variantIds: "$variants._id" },
                as: "inStocks",
                pipeline: [
                    {
                        $match: {
                            $expr: { $in: ["$variantId", "$$variantIds"] },
                        },
                    },
                    { $match: { stock: { $gt: 0 } } },
                    { $project: { _id: 1, variantId: 1, stock: 1 } },
                ],
            },
        },

        // 5) Có ít nhất 1 inventory stock > 0 => còn hàng
        {
            $match: {
                $expr: { $gt: [{ $size: "$inStocks" }, 0] },
            },
        },

        // 6) Sort theo totalSale giảm dần, tie-break theo updatedAt / _id
        { $sort: { totalSale: -1, updatedAt: -1, _id: -1 } },

        {
            $lookup: {
                from: "categoryschemas",
                localField: "categorySchemaId",
                foreignField: "_id",
                as: "productCategory",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                        },
                    },
                ],
            },
        },

        // 7) Phân trang + đếm tổng
        {
            $facet: {
                items: [
                    { $skip: skip },
                    { $limit: limit },
                    {
                        $project: {
                            _id: 1,
                            shopId: 1,
                            shopCategoryId: 1,
                            brandId: 1,
                            productCategory: 1,

                            name: 1,
                            slug: 1,
                            images: 1,
                            defaultPrice: 1,

                            ratingAvg: 1,
                            totalSale: 1,

                            shop: 1, // snapshot shop basic
                        },
                    },
                ],
                totalCount: [{ $count: "count" }],
            },
        },
    ];

    const [result] = await Product.aggregate(pipeline);

    return result;
}


/**
 * Hàm tìm kiếm và lọc sản phẩm
 * @param {Object} filters - Chứa các điều kiện lọc (keyword, minPrice, maxPrice, categoryIds, minRating...)
 * @param {Number} skip - Số lượng bỏ qua (phục vụ phân trang)
 * @param {Number} limit - Số lượng lấy (phục vụ phân trang)
 */
export const searchFilterProducts = async (filters, skip = 0, limit = 20) => {
    const {
        keyword,
        minPrice,
        maxPrice,
        categoryIds, // Đổi từ categoryId sang categoryIds (mảng)
        minRating,
        sortBy = "createdAt",
        order = -1 // -1 là giảm dần (desc), 1 là tăng dần (asc)
    } = filters;

    // 1) Khởi tạo điều kiện lọc cơ bản (chỉ lấy sản phẩm hợp lệ)
    const baseMatch = {
        status: "approved",
        activeStatus: "active",
        isDeleted: false,
    };

    // Lọc theo từ khóa (Tìm kiếm tương đối theo tên)
    if (keyword) {
        baseMatch.name = { $regex: keyword, $options: "i" }; // "i" để không phân biệt hoa/thường
    }

    // Lọc theo nhiều Category (sử dụng toán tử $in)
    if (categoryIds && categoryIds.length > 0) {
        baseMatch.categorySchemaId = {
            $in: categoryIds.map(id => new mongoose.Types.ObjectId(id))
        };
    }

    // Lọc theo Rating (Ví dụ: >= 1 sao, >= 4 sao...)
    if (minRating) {
        baseMatch.ratingAvg = { $gte: Number(minRating) };
    }

    // Lọc theo khoảng giá (Dựa trên defaultPrice của Product)
    if (minPrice !== undefined || maxPrice !== undefined) {
        baseMatch.defaultPrice = {};
        if (minPrice !== undefined) baseMatch.defaultPrice.$gte = Number(minPrice);
        if (maxPrice !== undefined) baseMatch.defaultPrice.$lte = Number(maxPrice);
    }

    // Thiết lập Sort động
    const sortObject = {};
    sortObject[sortBy] = Number(order);
    sortObject["_id"] = -1; // Tie-breaker: nếu các trường kia giống hệt nhau thì xếp theo _id mới nhất

    // 2) Xây dựng Pipeline
    const pipeline = [
        // Bước 1: Match lọc sản phẩm + điều kiện filter của user
        { $match: baseMatch },

        // Bước 2: Join shop và đảm bảo shop còn hoạt động
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
                        $project: { _id: 1, name: 1, avatar: 1, status: 1 },
                    },
                ],
            },
        },
        { $unwind: "$shop" }, // Loại luôn các sản phẩm nếu shop không hợp lệ

        // Bước 3: Join variants active
        {
            $lookup: {
                from: "variants",
                localField: "_id",
                foreignField: "productId",
                as: "variants",
                pipeline: [
                    {
                        $match: {
                            status: "active",
                            isDeleted: false,
                        },
                    },
                    { $project: { _id: 1 } },
                ],
            },
        },

        // Bước 4: Join inventory để kiểm tra tồn kho > 0
        {
            $lookup: {
                from: "inventories",
                let: { variantIds: "$variants._id" },
                as: "inStocks",
                pipeline: [
                    {
                        $match: {
                            $expr: { $in: ["$variantId", "$$variantIds"] },
                        },
                    },
                    { $match: { stock: { $gt: 0 } } },
                    { $project: { _id: 1, variantId: 1, stock: 1 } },
                ],
            },
        },

        // Bước 5: Đảm bảo có ít nhất 1 mặt hàng còn tồn kho
        {
            $match: {
                $expr: { $gt: [{ $size: "$inStocks" }, 0] },
            },
        },

        // Bước 6: Sắp xếp kết quả (Sort)
        { $sort: sortObject },

        // Bước 7: Lookup lấy thông tin Danh mục (tùy chọn để hiển thị đẹp)
        {
            $lookup: {
                from: "categoryschemas",
                localField: "categorySchemaId",
                foreignField: "_id",
                as: "productCategory",
                pipeline: [
                    { $project: { _id: 1, name: 1 } },
                ],
            },
        },
        {
            $unwind: {
                path: "$productCategory",
                preserveNullAndEmptyArrays: true // Vẫn giữ sản phẩm nếu lỡ category bị lỗi/xóa
            }
        },

        // Bước 8: Phân trang + Tính tổng số lượng (để làm Pagination ở FE)
        {
            $facet: {
                items: [
                    { $skip: Number(skip) },
                    { $limit: Number(limit) },
                    {
                        $project: {
                            _id: 1,
                            shopId: 1,
                            brandId: 1,
                            categorySchemaId: 1,
                            productCategory: 1,
                            name: 1,
                            slug: 1,
                            images: 1,
                            defaultPrice: 1,
                            ratingAvg: 1,
                            totalSale: 1,
                            shop: 1,
                        },
                    },
                ],
                totalCount: [{ $count: "count" }],
            },
        },
    ];

    const [result] = await Product.aggregate(pipeline);

    // Format lại response trả về cho dễ dùng
    const items = result?.items || [];
    const total = result?.totalCount?.[0]?.count || 0;

    return {
        items,
        total,
    };
};