import express from "express";
import { authenticationMiddleware } from "../middlewares/authenticationMiddlewares.js";
import { getVoucherByShop } from "../controllers/voucherController.js";

const router = express.Router();

router.get("/voucher-by-shop/:shopId", authenticationMiddleware, getVoucherByShop);

export default router;