import express, { Router } from "express";
import { authenticationMiddleware } from "../middlewares/authenticationMiddlewares.js";

import {
    followShop,
    unfollowShop,
    getMyFollowingShops,
    getShopFollowers,
} from "../controllers/shopFollowController.js";

const router = express.Router();

// Follow / Unfollow
router.post("/shops/:shopId/follow", authenticationMiddleware, followShop);
router.delete("/shops/:shopId/follow", authenticationMiddleware, unfollowShop);

// View lists
router.get(
    "/me/following/shops",
    authenticationMiddleware,
    getMyFollowingShops
);

// Public list followers of a shop (nếu muốn private thì thêm authenticationMiddleware)
router.get("/shops/:shopId/followers", getShopFollowers);

export default router;