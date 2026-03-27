import express from "express";
import { authenticationMiddleware, sellerMiddleware } from "../middlewares/authenticationMiddlewares.js";
import {
    createShopVoucher,
    deleteShopVoucher,
    getShopVoucherList,
    updateShopVoucher,
} from "../controllers/sellerVoucherController.js";

const router = express.Router();

router.use(authenticationMiddleware, sellerMiddleware);

router.get("/", getShopVoucherList);
router.post("/", createShopVoucher);
router.put("/:voucherId", updateShopVoucher);
router.delete("/:voucherId", deleteShopVoucher);

export default router;
