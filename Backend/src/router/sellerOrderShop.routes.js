import express from "express";
import {
  getPickupAddressList
} from "../controllers/sellerManageShopController.js";
import {
  authenticationMiddleware,
  sellerMiddleware
} from "../middlewares/authenticationMiddlewares.js";

const router = express.Router();

// Seller get pickup address list (for order shipping)
router.get(
  "/pickup-address-orders",
  authenticationMiddleware,
  sellerMiddleware,
  getPickupAddressList
);

export default router;
