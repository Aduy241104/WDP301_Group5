import { Product } from "../models/Product.js";
import { Shop } from "../models/Shop.js";
import { ShopCategory } from "../models/ShopCategory.js";
import { Brand } from "../models/Brand.js";
import mongoose from "mongoose";

export const getSimilarShopsByProductService = async ({
  productId,
  skip = 0,
  limit = 10,
}) => {
  const _id = new mongoose.Types.ObjectId(productId);

  const product = await Product.findOne({
    _id,
    isDeleted: false,
    status: "approved",
    activeStatus: "active",
  }).lean();

  if (!product) {
    return { items: [], totalCount: [{ count: 0 }] };
  }



  const matchStage = {
    categorySchemaId: product.categorySchemaId,
    shopId: { $ne: product.shopId }, // loại shop hiện tại
    isDeleted: false,
    status: "approved",
    activeStatus: "active",
  };

  const pipeline = [
    { $match: matchStage },

    // gom theo shop
    {
      $group: {
        _id: "$shopId",
        product: { $first: "$$ROOT" },
        totalSale: { $sum: "$totalSale" },
        avgRating: { $avg: "$ratingAvg" },
      },
    },

    // join shop + lọc shop hợp lệ
    {
      $lookup: {
        from: "shops",
        localField: "_id",
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
              description: 1,
            },
          },
        ],
      },
    },
    { $unwind: "$shop" },

    // SORT (quan trọng cho pagination)
    { $sort: { avgRating: -1, totalSale: -1, _id: -1 } },

    // PAGINATION
    {
      $facet: {
        items: [
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              shopId: "$shop._id",
              shopName: "$shop.name",
              shopAvatar: "$shop.avatar",
              shopDescription: "$shop.description",

              productName: "$product.name",
              price: "$product.defaultPrice",
              rating: { $round: ["$avgRating", 1] },
              totalSale: 1,
            },
          },
        ],
        totalCount: [{ $count: "count" }],
      },
    },
  ];

  const [result] = await Product.aggregate(pipeline);
  return result || { items: [], totalCount: [{ count: 0 }] };
};


export const getShopDetailService = async (shopId) => {
  if (!mongoose.Types.ObjectId.isValid(shopId)) {
    return null;
  }

  const shop = await Shop.findOne({
    _id: shopId,
    status: "approved",
    isBlockedByAdmin: false,
    isDeleted: false,
  })
    .select({
      _id: 1,
      name: 1,
      avatar: 1,
      description: 1,
      contactPhone: 1,
      shopAddress: 1,
      createdAt: 1,
    })
    .lean();

  return shop;
};

export const getShopCategoriesService = async (shopId) => {
  if (!mongoose.Types.ObjectId.isValid(shopId)) {
    throw new Error("Invalid shopId");
  }

  return await ShopCategory.find({
    shopId: new mongoose.Types.ObjectId(shopId),
    isDeleted: { $ne: true },
  })
    .select("_id name")
    .sort({ createdAt: 1 })
    .lean();
};

export const getShopProductsByCategoryService = async (shopId, shopCategoryId, options = {}) => {
  const { page = 1, limit = 10, sortBy = "createdAt", order = "desc" } = options;

  if (!mongoose.Types.ObjectId.isValid(shopId)) {
    throw new Error("Invalid shopId");
  }
  if (!mongoose.Types.ObjectId.isValid(shopCategoryId)) {
    throw new Error("Invalid shopCategoryId");
  }

  // 1. Lấy category của shop
  const shopCategory = await ShopCategory.findOne({
    _id: shopCategoryId,
    shopId: shopId,
  });

  if (!shopCategory) {
    throw new Error("Shop category not found");
  }

  // 2. Query sản phẩm theo productIds
  const query = {
    _id: { $in: shopCategory.productIds },
    shopId: shopId,
  };

  const skip = (page - 1) * limit;

  const sortOption = {};
  sortOption[sortBy] = order === "asc" ? 1 : -1;

  const [products, total] = await Promise.all([
    Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate("brandId", "name")
      .populate("shopCategoryId", "name")
      .lean(),

    Product.countDocuments(query),
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getShopProductsService = async (shopId, options = {}) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",   // rating | sold | price | createdAt
    order = "desc",
  } = options;

  if (!mongoose.Types.ObjectId.isValid(shopId)) {
    throw new Error("Invalid shopId");
  }

  const query = {
    shopId: shopId,
    isDeleted: { $ne: true },
  };

  const skip = (page - 1) * limit;

  const sortOption = {};
  sortOption[sortBy] = order === "asc" ? 1 : -1;

  const [products, total] = await Promise.all([
    Product.find(query)
      .select("name images defaultPrice ratingAvg totalSale")
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))
      .lean(),

    Product.countDocuments(query),
  ]);

  return {
    products,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};