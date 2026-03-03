import express from "express";
import { authenticationMiddleware } from "../middlewares/authenticationMiddlewares.js";

import {
    followShop,
    unfollowShop,
    getMyFollowingShops,
    getShopFollowers,
} from "../controllers/shopFollowController.js";

const router = express.Router();

router.post("/:shopId/follow", authenticationMiddleware, followShop);

router.delete("/:shopId/follow", authenticationMiddleware, unfollowShop);

router.get(
    "/me/following/shops",
    authenticationMiddleware,
    getMyFollowingShops
);


router.get("/:shopId/followers", getShopFollowers);

export default router;