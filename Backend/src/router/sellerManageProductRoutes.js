import express from "express";
import { getSellerProductList, createProduct } from "../controllers/sellerManageProductController.js";
import { authenticationMiddleware, sellerMiddleware } from "../middlewares/authenticationMiddlewares.js";
import { checkApprovedShop } from "../middlewares/checkApprovedShope.js";

const router = express.Router();

/**
 * Seller view product list
 */
router.get(
  "/",
  authenticationMiddleware,
  sellerMiddleware,
  checkApprovedShop,
  getSellerProductList
);

/**
 * Seller create product
 */
router.post(
  "/",
  authenticationMiddleware,
  sellerMiddleware,
  checkApprovedShop,
  createProduct
);

export default router;

