import mongoose from "mongoose";
import { Product } from "../models/Product.js";
import { StatusCodes } from "http-status-codes";



export const getTopSaleProducts = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page || "1", 10), 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit || "12", 10), 1), 50);
        const skip = (page - 1) * limit;

        const now = new Date();

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

                                // không trả variants/inStocks để nhẹ payload
                            },
                        },
                    ],
                    totalCount: [{ $count: "count" }],
                },
            },
        ];

        const [result] = await Product.aggregate(pipeline);

        const items = result?.items ?? [];
        const total = result?.totalCount?.[0]?.count ?? 0;
        const totalPages = Math.ceil(total / limit);

        return res.status(StatusCodes.OK).json({
            page,
            limit,
            total,
            totalPages,
            items,
            meta: {
                sortedBy: "totalSale_desc",
                filtered: {
                    productStatus: "approved",
                    shopStatus: "approved",
                    shopNotBlocked: true,
                    inStock: true,
                },
                now,
            },
        });
    } catch (err) {
        console.error("getTopSaleProducts error:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Internal server error",
        });
    }
};




export const getProductDetailById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid product id" });
        }

        const pipeline = [
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id),
                    status: "approved",
                    activeStatus: "active",
                    isDeleted: false,
                },
            },
            // shop must be active
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
                        { $project: { _id: 1, name: 1, avatar: 1, description: 1 } },
                    ],
                },
            },
            { $unwind: "$shop" },

            // variants active
            {
                $lookup: {
                    from: "variants",
                    localField: "_id",
                    foreignField: "productId",
                    as: "variants",
                    pipeline: [
                        { $match: { status: "active", isDeleted: false } },
                        { $project: { _id: 1, sku: 1, size: 1, price: 1 } },
                    ],
                },
            },

            // inventories for variants
            {
                $lookup: {
                    from: "inventories",
                    let: { variantIds: "$variants._id" },
                    as: "inventories",
                    pipeline: [
                        { $match: { $expr: { $in: ["$variantId", "$$variantIds"] } } },
                        { $project: { _id: 0, variantId: 1, stock: 1 } },
                    ],
                },
            },

            // merge stock into variants + compute totalStock
            {
                $addFields: {
                    variants: {
                        $map: {
                            input: "$variants",
                            as: "v",
                            in: {
                                _id: "$$v._id",
                                sku: "$$v.sku",
                                size: "$$v.size",
                                price: "$$v.price",
                                stock: {
                                    $let: {
                                        vars: {
                                            inv: {
                                                $first: {
                                                    $filter: {
                                                        input: "$inventories",
                                                        as: "inv",
                                                        cond: { $eq: ["$$inv.variantId", "$$v._id"] },
                                                    },
                                                },
                                            },
                                        },
                                        in: { $ifNull: ["$$inv.stock", 0] },
                                    },
                                },
                            },
                        },
                    },
                    totalStock: {
                        $sum: {
                            $map: {
                                input: "$inventories",
                                as: "i",
                                in: "$$i.stock",
                            },
                        },
                    },
                },
            },
            {
                $addFields: {
                    inStock: { $gt: ["$totalStock", 0] },
                },
            },

            // shape for customer detail
            {
                $project: {
                    _id: 1,
                    shopId: 1,
                    name: 1,
                    slug: 1,
                    description: 1,
                    origin: 1,
                    images: 1,
                    attributes: 1,

                    defaultPrice: 1,
                    ratingAvg: 1,
                    totalSale: 1,

                    publishedAt: 1,

                    shop: 1,

                    variants: 1, // nếu bạn muốn "chưa cần size+stock" thì mình sẽ bỏ phần này
                    totalStock: 1,
                    inStock: 1,
                },
            },
        ];

        const [item] = await Product.aggregate(pipeline);

        if (!item) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Product not found or unavailable",
            });
        }

        return res.status(StatusCodes.OK).json({ item });
    } catch (err) {
        console.error("getProductDetailById error:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
    }
};