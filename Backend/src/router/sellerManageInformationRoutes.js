import express from "express";
import { authenticationMiddleware, sellerMiddleware } from "../middlewares/authenticationMiddlewares.js";
import { checkApprovedShop } from "../middlewares/checkApprovedShope.js";
import { viewStoreInformation, updateStoreInformation } from "../controllers/sellerManageInformationController.js";

const router = express.Router();

// View store information (Seller)
router.get(
    "/information",
    authenticationMiddleware,
    sellerMiddleware,
    checkApprovedShop,
    viewStoreInformation
);

// Update store information (Seller)
router.put(
    "/information",
    authenticationMiddleware,
    sellerMiddleware,
    checkApprovedShop,
    updateStoreInformation
);

export default router;
