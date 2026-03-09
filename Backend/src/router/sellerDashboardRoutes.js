import express from "express";

import {
  getTopSellingProducts,
  getProductQuantity,
} from "../controllers/sellerDashboardController.js";

import {
  authenticationMiddleware,
  sellerMiddleware,
} from "../middlewares/authenticationMiddlewares.js";

const router = express.Router();

router.use(authenticationMiddleware, sellerMiddleware);

router.get("/top-products", getTopSellingProducts);
router.get("/product-quantity", getProductQuantity);

export default router;