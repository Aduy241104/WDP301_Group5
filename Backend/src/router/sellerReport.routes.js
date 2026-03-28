import express from "express";

import {
  SellerReportListController,
  SellerReportDetailController,
  SellerShopReportListController,
} from "../controllers/sellerReportController.js";

import {
  authenticationMiddleware,
  sellerMiddleware,
} from "../middlewares/authenticationMiddlewares.js";

const router = express.Router();

// apply middleware giống order
router.use(authenticationMiddleware, sellerMiddleware);

// routes
router.get("/", SellerReportListController);

// 👇 phải đặt trước
router.get("/shop-reports", SellerShopReportListController);

// 👇 để sau cùng
router.get("/:reportId", SellerReportDetailController);
export default router;
