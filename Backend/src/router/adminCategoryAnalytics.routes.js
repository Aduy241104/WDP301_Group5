import express from "express";
import {
    AdminRevenueByCategoryController
} from "../controllers/AdminCategoryAnalyticsController.js";
const router = express.Router();

// Revenue Analytics
router.get("/category", AdminRevenueByCategoryController);

export default router;