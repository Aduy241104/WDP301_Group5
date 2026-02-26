import {
  getSimilarShopsByProductService,
  getShopDetailService,
  getShopProductsByCategoryService,
  getShopProductsService,
  getShopCategoriesService
} from "../services/shopService.js";
import { ShopCategory } from "../models/ShopCategory.js";
import mongoose from "mongoose";



export const getSimilarShopsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const result = await getSimilarShopsByProductService({
      productId,
      skip,
      limit: Number(limit),
    });

    res.json({
      success: true,
      items: result.items,
      total: result.totalCount?.[0]?.count || 0,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    console.error("Get similar shops error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get similar shops",
    });
  }
};


export const getShopDetail = async (req, res) => {
  try {
    const { shopId } = req.params;

    const shop = await getShopDetailService(shopId);

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    res.json({
      success: true,
      shop,
    });
  } catch (error) {
    console.error("Get shop detail error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get shop detail",
    });
  }
};


export const getShopCategoriesByShop = async (req, res) => {
  try {
    const { shopId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(shopId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid shopId",
      });
    }

    const categories = await ShopCategory.find({
      shopId: shopId,
      isDeleted: { $ne: true },
    })
      .select("_id name")
      .sort({ createdAt: 1 })
      .lean();

    res.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Get shop categories error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get shop categories",
    });
  }
};

export const getShopProductsByCategory = async (req, res) => {
  try {
    const { shopId, shopCategoryId } = req.params;
    const { page, limit, sortBy, order } = req.query;

    const data = await getShopProductsByCategoryService(
      shopId,
      shopCategoryId,
      { page, limit, sortBy, order }
    );

    res.json({
      success: true,
      message: "Get shop products by category successfully",
      ...data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getShopProducts = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { page, limit, sortBy, order } = req.query;

    const data = await getShopProductsService(shopId, {
      page,
      limit,
      sortBy,
      order,
    });

    res.json({
      success: true,
      message: "Get shop products successfully",
      ...data,
    });
  } catch (error) {
    console.error("Get shop products error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getShopCategories = async (req, res) => {
  try {
    const { shopId } = req.params;

    const categories = await getShopCategoriesService(shopId);

    res.json({
      success: true,
      categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};