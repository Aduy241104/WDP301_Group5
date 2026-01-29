import express from "express";
import { checkAddToCartAvailability } from "../middlewares/cartMiddleware/checkAddToCartAvailability.js";
import { checkUpdateCartItemQty } from "../middlewares/cartMiddleware/checkUpdateCartItemQty.js";
import { checkDeleteCartItem } from "../middlewares/cartMiddleware/checkDeleteCartItem.js"
import { authenticationMiddleware } from "../middlewares/authenticationMiddlewares.js";
import { groupCartByShop } from "../middlewares/cartMiddleware/groupCartByShop.js";
import {
    addToCart,
    updateCartItemQty,
    deleteCartItem,
    viewCart
} from "../controllers/cartController.js";

const router = express.Router();

router.get(
    "/",
    authenticationMiddleware,
    viewCart,
    groupCartByShop
)

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