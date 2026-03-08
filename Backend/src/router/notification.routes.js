import express from "express";
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
} from "../controllers/notificationController.js";
import {
  authenticationMiddleware,
  sellerMiddleware,
} from "../middlewares/authenticationMiddlewares.js";

const router = express.Router();
router.use(authenticationMiddleware, sellerMiddleware);


router.get("/",  getNotifications);
router.get("/unread-count",  getUnreadCount);
router.patch("/:id/read",  markNotificationRead);

export default router;