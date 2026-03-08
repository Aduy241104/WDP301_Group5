import express from "express";
import { getAdminCategories } from "../controllers/AdminCategoryController.js";

const router = express.Router();

router.get("/", getAdminCategories);

export default router;

