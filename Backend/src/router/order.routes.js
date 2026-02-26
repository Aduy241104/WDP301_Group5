import express from "express";
import { prepareOrdersFromCart, createOrdersFromCart, listMyOrders, getMyOrderDetail } from "../controllers/orderController.js";
import { authenticationMiddleware } from "../middlewares/authenticationMiddlewares.js";
import { applyShopVoucherPreview, applySystemShipVoucherPreview } from "../controllers/voucherController.js";
import { createOrdersFromCartSchema } from "../middlewares/orderMiddleware/orderValidation.js";
import { validateBody } from "../middlewares/orderMiddleware/validateBody.js";

const router = express.Router();
router.post("/create-order", authenticationMiddleware, prepareOrdersFromCart);

router.post("/shops/:shopId/apply-voucher", authenticationMiddleware, applyShopVoucherPreview);

router.post("/system/apply-voucher", authenticationMiddleware, applySystemShipVoucherPreview);

router.post("/place-order", authenticationMiddleware, validateBody(createOrdersFromCartSchema), createOrdersFromCart);

router.get("/my-orders", authenticationMiddleware, listMyOrders);

router.get("/order-detail/:orderId", authenticationMiddleware, getMyOrderDetail);

export default router;


