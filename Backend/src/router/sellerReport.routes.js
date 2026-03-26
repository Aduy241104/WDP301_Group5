import express from "express";

import {
  SellerReportListController,
  SellerReportDetailController,
} from "../controllers/sellerReportController.js";

import {
  authenticationMiddleware,
} from "../middlewares/authenticationMiddlewares.js";

const router = express.Router();

// apply middleware giống order
router.use(authenticationMiddleware);

// routes
router.get("/", SellerReportListController);
router.get("/:reportId", SellerReportDetailController);

export default router;