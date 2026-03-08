import express from "express";
import {
    AdminGMVStatisticsController,
    AdminRevenueByShopController,
    AdminRevenueByCategoryController
} from "../controllers/AdminRevenueAnalyticsController.js";
const router = express.Router();

// Revenue Analytics
router.get("/gmv-statistics", AdminGMVStatisticsController);
router.get("/by-shop", AdminRevenueByShopController);
router.get("/category", AdminRevenueByCategoryController);

export default router;