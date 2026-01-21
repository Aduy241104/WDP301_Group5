import express from "express";
import { getTopSaleProducts, getProductDetailById } from "../controllers/productDiscoveryController.js";

const router = express.Router();

router.get("/top-sale", getTopSaleProducts);

router.get("/product-detail/:id", getProductDetailById);

export default router;