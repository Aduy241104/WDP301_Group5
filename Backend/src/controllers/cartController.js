import mongoose from "mongoose";
import { Cart } from "../models/Cart.js";
import { Inventory } from "../models/Inventory.js";
import { Variant } from "../models/Variant.js";
import { Product } from "../models/Product.js";
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

export const viewCart = async (req, res, next) => {
    const userId = req.user.id;

    const cart = await Cart.findOne({ userId }).lean();
    if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
        res.locals.cartPayload = {
            items: [],
            meta: { changed: false, removedCount: 0, adjustedCount: 0, totalItems: 0 },
        };
        return next();
    }

    const items = cart.items;

    const variantIds = items
        .map((it) => it?.variantId)
        .filter(Boolean)
        .map((id) => new mongoose.Types.ObjectId(id));

    const variants = await Variant.find({
        _id: { $in: variantIds },
        isDeleted: false,
        status: "active",
    })
        .select("_id productId sku size price")
        .lean();

    const variantMap = new Map(variants.map((v) => [String(v._id), v]));

    const productIds = variants.map((v) => v.productId).filter(Boolean);
    const products = await Product.find({
        _id: { $in: productIds },
        isDeleted: false,
        activeStatus: "active",
        // status: "approved",
    })
        .select("_id shopId name slug images ratingAvg totalSale")
        .lean();

    const productMap = new Map(products.map((p) => [String(p._id), p]));

    const inventories = await Inventory.find({
        variantId: { $in: variantIds },
    })
        .select("variantId stock")
        .lean();

    const stockMap = new Map(inventories.map((inv) => [String(inv.variantId), inv.stock ?? 0]));

    let changed = false;
    let removedCount = 0;
    let adjustedCount = 0;

    const keptItems = [];
    const responseItems = [];
    
    for (let i = 0; i < items.length; i++) {
        const it = items[i];
        const vId = String(it.variantId);

        const variant = variantMap.get(vId);
        if (!variant) {
            changed = true;
            removedCount++;
            continue;
        }

        const product = productMap.get(String(variant.productId));
        if (!product) {
            changed = true;
            removedCount++;
            continue;
        }

        const stock = Number(stockMap.get(vId) ?? 0);
        const inStock = stock > 0;

        let finalQty = Number(it.quantity ?? 1);
        if (finalQty < 1) finalQty = 1;

        //Nếu stock > 0 và quantity vượt stock -> clamp
        if (stock >= 0 && finalQty > stock) {
            finalQty = stock;

            changed = true;
            adjustedCount++;
        }

        keptItems.push({ variantId: it.variantId, quantity: finalQty });

        responseItems.push({
            variantId: variant._id,
            quantity: finalQty,
            stock,
            inStock,
            variant: {
                _id: variant._id,
                sku: variant.sku,
                size: variant.size,
                price: variant.price,
            },
            product: {
                _id: product._id,
                shopId: product.shopId,
                name: product.name,
                slug: product.slug,
                images: product.images,
                ratingAvg: product.ratingAvg,
                totalSale: product.totalSale,
            },
        });
    }

    if (changed) {
        await Cart.findOneAndUpdate(
            { userId },
            { $set: { items: keptItems, updatedAt: new Date() } }
        );
    }

    res.locals.cartPayload = {
        items: responseItems,
        meta: {
            changed,
            removedCount,
            adjustedCount,
            totalItems: responseItems.length,
        },
    };

    return next();
};


export default {
    addToCart
}