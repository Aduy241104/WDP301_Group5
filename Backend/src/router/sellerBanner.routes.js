import express from "express";

import {
  getShopBanners,
  addShopBanner,
  updateShopBanner,
  deleteShopBanner,
} from "../controllers/sellerShopBannerController.js";

import {
  authenticationMiddleware,
  sellerMiddleware
} from "../middlewares/authenticationMiddlewares.js";

const router = express.Router();

router.get("/", authenticationMiddleware, sellerMiddleware, getShopBanners);

router.post("/", authenticationMiddleware, sellerMiddleware, addShopBanner);

router.put("/:id", authenticationMiddleware, sellerMiddleware, updateShopBanner);

router.delete("/:id", authenticationMiddleware, sellerMiddleware, deleteShopBanner);

export default router;