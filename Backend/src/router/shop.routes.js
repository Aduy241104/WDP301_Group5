import express from "express";
import { getSimilarShopsByProduct, getShopDetail, getShopProductsByCategory, getShopProducts,  getShopCategoriesByShop } from "../controllers/shopController.js";

const router = express.Router();

// View Shop List
router.get("/similar/:productId", getSimilarShopsByProduct);

router.get("/:shopId", getShopDetail);

// GET /api/shop-categories/shop/:shopId
router.get("/shopcategories/:shopId", getShopCategoriesByShop);


router.get("/:shopId/categories/:shopCategoryId/products",getShopProductsByCategory);

// /api/shops/:shopId/products
router.get("/:shopId/products", getShopProducts);

export default router;
