import express from "express";

import {
  SellerReportListController,
  SellerReportDetailController,
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
router.get("/:reportId", SellerReportDetailController);

export default router;