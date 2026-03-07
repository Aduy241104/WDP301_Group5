import express from "express";
import {
  getSellerCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryProducts,
  getAvailableProductsForCategory,
  addProductsToCategory,
  deleteProductFromCategory,
} from "../controllers/sellerManageCategoryController.js";
import { checkApprovedShop } from "../middlewares/checkApprovedShope.js";
import {
  authenticationMiddleware,
  sellerMiddleware,
} from "../middlewares/authenticationMiddlewares.js";

// Seller manage categories of their shop
const router = express.Router();

router.get("/", authenticationMiddleware, sellerMiddleware, checkApprovedShop, getSellerCategories);

router.post("/", authenticationMiddleware, sellerMiddleware, checkApprovedShop, createCategory);

router.put(
  "/:categoryId",
  authenticationMiddleware,
  sellerMiddleware,
  checkApprovedShop,
  updateCategory
);

router.delete(
  "/:categoryId",
  authenticationMiddleware,
  sellerMiddleware,
  checkApprovedShop,
  deleteCategory
);

router.get(
  "/:categoryId/products",
  authenticationMiddleware,
  sellerMiddleware,
  checkApprovedShop,
  getCategoryProducts
);

router.get(
  "/:categoryId/available-products",
  authenticationMiddleware,
  sellerMiddleware,
  checkApprovedShop,
  getAvailableProductsForCategory
);

router.post(
  "/:categoryId/products",
  authenticationMiddleware,
  sellerMiddleware,
  checkApprovedShop,
  addProductsToCategory
);

router.delete(
  "/:categoryId/products/:productId",
  authenticationMiddleware,
  sellerMiddleware,
  checkApprovedShop,
  deleteProductFromCategory
);

export default router;