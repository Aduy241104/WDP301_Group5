import express from "express";
import {
  getSellerProductList,
  createProduct,
  updateProduct,
  getSellerProductDetail,
  deleteSellerProduct,
  updateProductActiveStatus,
} from "../controllers/sellerManageProductController.js";
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

router.get(
  "/:productId",
  authenticationMiddleware,
  sellerMiddleware,
  checkApprovedShop,
  getSellerProductDetail
);

router.put(
  "/:productId",
  authenticationMiddleware,
  sellerMiddleware,
  checkApprovedShop,
  updateProduct
);

router.delete(
  "/:productId",
  authenticationMiddleware,
  sellerMiddleware,
  checkApprovedShop,
  deleteSellerProduct
);

// seller can change active/inactive status
router.patch(
  "/:productId/active",
  authenticationMiddleware,
  sellerMiddleware,
  checkApprovedShop,
  updateProductActiveStatus
);

export default router;

