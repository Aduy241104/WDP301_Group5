import express from "express";
import { prepareOrdersFromCart } from "../controllers/orderController.js";
import { authenticationMiddleware } from "../middlewares/authenticationMiddlewares.js";
import { applyShopVoucherPreview, applySystemShipVoucherPreview } from "../controllers/voucherController.js";

const router = express.Router();
router.post("/create-order", authenticationMiddleware, prepareOrdersFromCart);

router.post("/shops/:shopId/apply-voucher", authenticationMiddleware, applyShopVoucherPreview);

router.post("/system/apply-voucher", authenticationMiddleware, applySystemShipVoucherPreview);

export default router;


