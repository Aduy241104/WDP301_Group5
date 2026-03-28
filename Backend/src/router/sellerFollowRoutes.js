import express from "express";
import { authenticationMiddleware } from "../middlewares/authenticationMiddlewares.js";
import {
  getMyShopFollowers,
  getMyShopFollowersCount,
  getTopFollowersByNumberOfOrders,
  getFollowerPurchaseConversionRate,
  getFollowerDetail
} from "../controllers/sellerFollowController.js";

const router = express.Router();

router.get("/", authenticationMiddleware, getMyShopFollowers);

router.get("/count", authenticationMiddleware, getMyShopFollowersCount);

router.get(
  "/top-by-orders",
  authenticationMiddleware,
  getTopFollowersByNumberOfOrders,
);

router.get(
  "/purchase-conversion-rate",
  authenticationMiddleware,
  getFollowerPurchaseConversionRate,
);

router.get("/:userId", authenticationMiddleware, getFollowerDetail);

export default router;
