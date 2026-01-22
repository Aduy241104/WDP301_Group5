import express from "express";
import { addPickupAddress, getPickupAddressList, getPickupAddressDetail, updatePickupAddress, deletePickupAddress, setDefaultPickupAddress } from "../controllers/sellerManageShopController.js";
import { authenticationMiddleware, sellerMiddleware } from "../middlewares/authenticationMiddlewares.js";

const router = express.Router();

// Seller add pickup address
router.post("/pickup-address", authenticationMiddleware, sellerMiddleware, addPickupAddress);

// Seller get pickup address list
router.get("/pickup-address", authenticationMiddleware, sellerMiddleware, getPickupAddressList);

router.get("/pickup-address/:pickupAddressId", authenticationMiddleware, sellerMiddleware,getPickupAddressDetail);

router.put("/pickup-address/:pickupAddressId", authenticationMiddleware, sellerMiddleware, updatePickupAddress);

router.delete("/pickup-address/:pickupAddressId", authenticationMiddleware, sellerMiddleware, deletePickupAddress);

router.put("/pickup-address/:pickupAddressId/set-default", authenticationMiddleware, sellerMiddleware, setDefaultPickupAddress);

export default router;
