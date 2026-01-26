import express from "express";
import {
  getOrders,
  getOrderDetail,
  confirmOrder,
  cancelOrder,
  updateOrderStatus,
} from "../controllers/sellerOrderController.js";

const router = express.Router();

router.get("/", getOrders);
router.get("/:id", getOrderDetail);

router.patch("/:id/confirm", confirmOrder);
router.patch("/:id/cancel", cancelOrder);
router.patch("/:id/status", updateOrderStatus);

export default router;
