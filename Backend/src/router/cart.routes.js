import express from "express";
import { checkAddToCartAvailability } from "../middlewares/cartMiddleware/checkAddToCartAvailability.js";
import { checkUpdateCartItemQty } from "../middlewares/cartMiddleware/checkUpdateCartItemQty.js";
import { checkDeleteCartItem } from "../middlewares/cartMiddleware/checkDeleteCartItem.js"
import { authenticationMiddleware } from "../middlewares/authenticationMiddlewares.js";
import {
    addToCart,
    updateCartItemQty,
    deleteCartItem
} from "../controllers/cartController.js";

const router = express.Router();

router.post(
    "/add",
    authenticationMiddleware,
    checkAddToCartAvailability,
    addToCart
);

router.patch(
    "/update/:variantId",
    authenticationMiddleware,
    checkUpdateCartItemQty,
    updateCartItemQty
);

router.delete(
    "/delete/:variantId",
    authenticationMiddleware,
    checkDeleteCartItem,
    deleteCartItem
);

export default router;