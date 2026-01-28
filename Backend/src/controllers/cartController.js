import { Cart } from "../models/Cart.js";
import { StatusCodes } from "http-status-codes";

export const addToCart = async (req, res) => {
    const userId = req.user.id;
    const { variantId, quantity } = req.body;
    const { nextQty, currentQty } = req.cartValidated;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
        cart = await Cart.create({
            userId,
            items: [{ variantId, quantity }],
        });
    } else {
        const index = cart.items.findIndex(
            (it) => String(it.variantId) === String(variantId)
        );

        if (index >= 0) {
            cart.items[index].quantity = nextQty;
        } else {
            cart.items.push({ variantId, quantity });
        }

        cart.updatedAt = new Date();
        await cart.save();
    }

    return res.status(StatusCodes.OK).json({
        message: "Added to cart.",
        cart,
    });
};

export const updateCartItemQty = async (req, res) => {
    const userId = req.user.id;
    const { variantId, requestedQty } = req.cartItemCtx;

    const cart = await Cart.findOne({ userId });
    const idx = cart.items.findIndex((it) => String(it.variantId) === String(variantId));

    cart.items[idx].quantity = requestedQty;
    cart.updatedAt = new Date();
    await cart.save();

    return res.status(StatusCodes.OK).json({
        message: "Cart item updated.",
        cart,
    });
};

export const deleteCartItem = async (req, res) => {
    const userId = req.user.id;
    const { variantId } = req.cartItemCtx;

    const cart = await Cart.findOne({ userId });

    cart.items = cart.items.filter((it) => String(it.variantId) !== String(variantId));
    cart.updatedAt = new Date();
    await cart.save();

    return res.status(StatusCodes.OK).json({
        message: "Cart item deleted.",
        cart,
    });
};


export default {
    addToCart
}