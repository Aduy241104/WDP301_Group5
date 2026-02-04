import express from "express";
import {
    getTopSaleProducts,
    getProductDetailById,
    getProductDiscovery,
    getRecommendedProducts
} from "../controllers/productDiscoveryController.js";

import { optionalAuthenticationMiddleware } from "../middlewares/authenticationMiddlewares.js";

const router = express.Router();

router.get("/", getProductDiscovery);

router.get("/top-sale", getTopSaleProducts);

router.get("/product-detail/:id", getProductDetailById);

router.get("/recomment", optionalAuthenticationMiddleware, getRecommendedProducts);

export default router;