import express from "express";
import { authenticationMiddleware } from "../middlewares/authenticationMiddlewares.js";
import {
  getMyShopFollowers,
  getMyShopFollowersCount,
} from "../controllers/sellerFollowController.js";

const router = express.Router();

router.get(
  "/",
  authenticationMiddleware,
  getMyShopFollowers
);

router.get(
  "/count",
  authenticationMiddleware,
  getMyShopFollowersCount
);

export default router;