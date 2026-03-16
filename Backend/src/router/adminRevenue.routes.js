import express from "express";
import {
    AdminGMVStatisticsController,
    AdminRevenueByShopController,
} from "../controllers/AdminRevenueAnalyticsController.js";
const router = express.Router();

// Revenue Analytics
router.get("/gmv-statistics", AdminGMVStatisticsController);
router.get("/by-shop", AdminRevenueByShopController);

export default router;