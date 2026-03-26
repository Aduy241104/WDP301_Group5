import express from "express";
import {
    getTopSaleProducts,
    getProductDetailById,
    getProductDiscovery,
    getRecommendedProducts,
    getSearchedProducts
} from "../controllers/productDiscoveryController.js";

import { optionalAuthenticationMiddleware } from "../middlewares/authenticationMiddlewares.js";
import { validateSearchProduct } from "../middlewares/validateSearch.js";

const router = express.Router();

router.get("/", optionalAuthenticationMiddleware, getProductDiscovery);

router.get("/top-sale", getTopSaleProducts);

router.get("/product-detail/:id", getProductDetailById);

router.get("/recomment", optionalAuthenticationMiddleware, getRecommendedProducts);

router.post("/search", validateSearchProduct, getSearchedProducts);

export default router;