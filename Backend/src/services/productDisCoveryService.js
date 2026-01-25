import { Product } from "../models/Product.js";

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

                            // không trả variants/inStocks để nhẹ payload
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