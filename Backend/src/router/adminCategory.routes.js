import express from "express";
import { authenticationMiddleware, adminMiddleware } from "../middlewares/authenticationMiddlewares.js";
import {
    getAdminCategories,
    listAdminCategories,
    getAdminCategoryById,
    createAdminCategory,
    updateAdminCategory,
} from "../controllers/AdminCategoryController.js";

const router = express.Router();
const adminGuard = [authenticationMiddleware, adminMiddleware];

// Phải khai báo /manage trước /:id
router.get("/manage", adminGuard, listAdminCategories);
router.post("/", adminGuard, createAdminCategory);
router.put("/:id", adminGuard, updateAdminCategory);
router.get("/:id", adminGuard, getAdminCategoryById);
router.get("/", adminGuard, getAdminCategories);

export default router;
