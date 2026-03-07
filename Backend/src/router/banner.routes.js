import express from "express";
import {
  getBannersByPosition,
  getPopupBanner,
  createBanner,
  updateBanner,
  deleteBanner
} from "../controllers/bannerController.js";

import {
  authenticationMiddleware,
  adminMiddleware
} from "../middlewares/authenticationMiddlewares.js";

const router = express.Router();


router.get("/popup/banner", authenticationMiddleware, adminMiddleware, getPopupBanner);

router.get("/:position", authenticationMiddleware, adminMiddleware, getBannersByPosition);

router.post("/", authenticationMiddleware, adminMiddleware, createBanner);

router.put("/:id", authenticationMiddleware, adminMiddleware, updateBanner);

router.delete("/:id", authenticationMiddleware, adminMiddleware, deleteBanner);

export default router;