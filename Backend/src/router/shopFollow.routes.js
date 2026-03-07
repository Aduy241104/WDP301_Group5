import express from "express";
import { authenticationMiddleware } from "../middlewares/authenticationMiddlewares.js";

import {
    followShop,
    unfollowShop,
    getMyFollowingShops,
    getShopFollowersCount,
    checkFollowShop
} from "../controllers/shopFollowController.js";

const router = express.Router();

router.post("/:shopId/follow", authenticationMiddleware, followShop);

router.delete("/:shopId/follow", authenticationMiddleware, unfollowShop);

router.get(
    "/me/following/shops",
    authenticationMiddleware,
    getMyFollowingShops
);


router.get("/:shopId/followers", getShopFollowersCount);

router.get(
    "/:shopId/is-following",
    authenticationMiddleware,
    checkFollowShop
);


export default router;