import express from "express";
import {
  getOrders,
  getOrderDetail,
  confirmOrder,
  cancelOrder,
  updateOrderStatus,
  getOrderPickupAddresses,
  getDashboardStats,
} from "../controllers/sellerOrderController.js";

import {
  authenticationMiddleware,
  sellerMiddleware,
} from "../middlewares/authenticationMiddlewares.js";


const router = express.Router();

router.use(authenticationMiddleware, sellerMiddleware);
router.get("/", getOrders);
router.get("/dashboard/stats", getDashboardStats, authenticationMiddleware, sellerMiddleware);
router.get("/:id/pickup-addresses", getOrderPickupAddresses);
router.get("/:id", getOrderDetail);

router.patch("/:id/confirm", confirmOrder);
router.patch("/:id/cancel", cancelOrder);
router.patch("/:id/status", updateOrderStatus);

export default router;
