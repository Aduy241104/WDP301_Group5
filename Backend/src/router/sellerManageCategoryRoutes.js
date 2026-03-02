import express from "express";
import { getSellerCategories, createCategory } from "../controllers/sellerManageCategoryController.js";
import { checkApprovedShop } from "../middlewares/checkApprovedShope.js";
import { authenticationMiddleware, sellerMiddleware,  } from "../middlewares/authenticationMiddlewares.js";

const router = express.Router();

router.get("/", authenticationMiddleware, sellerMiddleware, checkApprovedShop, getSellerCategories);

router.post("/", authenticationMiddleware, sellerMiddleware, checkApprovedShop, createCategory);

export default router;