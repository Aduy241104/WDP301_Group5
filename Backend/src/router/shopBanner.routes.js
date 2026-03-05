import express from "express";
import { getShopBanners } from "../controllers/shopBannerController.js";

const router = express.Router();

router.get("/banner/:shopId", getShopBanners);

export default router;