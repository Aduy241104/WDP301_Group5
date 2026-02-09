import express from "express";
import { 
  getBannersByPosition, 
  getPopupBanner,
  createBanner,
  updateBanner,
  deleteBanner
} from "../controllers/bannerController.js";
import { authenticationMiddleware, adminMiddleware } from "../middlewares/authenticationMiddlewares.js";

const router = express.Router();

// Public routes
router.get("/popup/banner", getPopupBanner);
router.get("/:position", getBannersByPosition);


router.post("/", authenticationMiddleware, adminMiddleware, createBanner);       // Tạo banner mới
router.put("/:id", authenticationMiddleware, adminMiddleware, updateBanner);     // Cập nhật banner
router.delete("/:id", authenticationMiddleware, adminMiddleware, deleteBanner);  // Xóa banner

export default router;
