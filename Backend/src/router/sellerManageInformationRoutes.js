import express from "express";
import { authenticationMiddleware, sellerMiddleware } from "../middlewares/authenticationMiddlewares.js";
import { checkApprovedShop } from "../middlewares/checkApprovedShope.js";
import { uploadMemory } from "../middlewares/multerMemory.js";
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
    // accept single file field named 'avatar' to change the shop avatar
    uploadMemory.single("avatar"),
    updateStoreInformation
);

export default router;
