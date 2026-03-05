import express from "express";
import {
    getSellerInventoryList,
    getSellerProductInventory,
    updateInventoryStock,
} from "../controllers/sellerInventoryController.js";
import { authenticationMiddleware, sellerMiddleware } from "../middlewares/authenticationMiddlewares.js";
import { checkApprovedShop } from "../middlewares/checkApprovedShope.js";

const router = express.Router();

// view list
router.get(
    "/",
    authenticationMiddleware,
    sellerMiddleware,
    checkApprovedShop,
    getSellerInventoryList
);

// product detail with all variants + inventory
router.get(
    "/product/:productId",
    authenticationMiddleware,
    sellerMiddleware,
    checkApprovedShop,
    getSellerProductInventory
);

// update stock
router.put(
    "/:inventoryId",
    authenticationMiddleware,
    sellerMiddleware,
    checkApprovedShop,
    updateInventoryStock
);

export default router;
