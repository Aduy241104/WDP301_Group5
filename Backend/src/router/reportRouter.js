import express from "express";
import {
  createReport,
  sendProductReport,
  sendShopReport,
  checkReport,
} from "../controllers/reportController.js";
import { authenticationMiddleware } from "../middlewares/authenticationMiddlewares.js";

const router = express.Router();

router.post("/create-report", authenticationMiddleware, createReport);
router.post(
  "/send-product-report",
  authenticationMiddleware,
  sendProductReport,
);
router.get("/check", authenticationMiddleware, checkReport);
router.post("/send-shop-report", authenticationMiddleware, sendShopReport);

export default router;