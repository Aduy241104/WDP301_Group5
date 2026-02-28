import express from "express";
import { addPickupAddress, getPickupAddressList, getPickupAddressDetail, updatePickupAddress, deletePickupAddress, setDefaultPickupAddress } from "../controllers/sellerManageShopController.js";
import { authenticationMiddleware, sellerMiddleware } from "../middlewares/authenticationMiddlewares.js";
import { checkApprovedShop } from "../middlewares/checkApprovedShope.js";
import { getShopBanners, addShopBanner, updateShopBanner, deleteShopBanner } from "../controllers/sellerShopBannerController.js";

const router = express.Router();

// Seller add pickup address
router.post("/pickup-address", authenticationMiddleware, sellerMiddleware, checkApprovedShop, addPickupAddress);

// Seller get pickup address list
router.get("/pickup-address", authenticationMiddleware, sellerMiddleware, checkApprovedShop, getPickupAddressList);

router.get("/pickup-address/:pickupAddressId", authenticationMiddleware, sellerMiddleware, checkApprovedShop, getPickupAddressDetail);

router.put("/pickup-address/:pickupAddressId", authenticationMiddleware, sellerMiddleware, checkApprovedShop, updatePickupAddress);

router.delete("/pickup-address/:pickupAddressId", authenticationMiddleware, sellerMiddleware, checkApprovedShop, deletePickupAddress);

router.put("/pickup-address/:pickupAddressId/set-default", authenticationMiddleware, sellerMiddleware, checkApprovedShop, setDefaultPickupAddress);

// Shop Banner Management (Seller)
router.get("/banners", authenticationMiddleware, sellerMiddleware, checkApprovedShop, getShopBanners);
router.post("/banners", authenticationMiddleware, sellerMiddleware, checkApprovedShop, addShopBanner);
router.put("/banners/:bannerId", authenticationMiddleware, sellerMiddleware, checkApprovedShop, updateShopBanner);
router.delete("/banners/:bannerId", authenticationMiddleware, sellerMiddleware, checkApprovedShop, deleteShopBanner);

export default router;
