import express from "express";
import { getTopSaleProducts } from "../controllers/productDiscoveryController.js";

const router = express.Router();

router.get("/top-sale", getTopSaleProducts);

export default router;