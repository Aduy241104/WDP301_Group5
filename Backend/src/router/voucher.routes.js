import express from "express";
import { authenticationMiddleware } from "../middlewares/authenticationMiddlewares.js";
import { getSystemVouchers, getVoucherByShop } from "../controllers/voucherController.js";

const router = express.Router();

router.get("/voucher-by-shop/:shopId", authenticationMiddleware, getVoucherByShop);

router.get("/system-voucher", authenticationMiddleware, getSystemVouchers);

export default router;