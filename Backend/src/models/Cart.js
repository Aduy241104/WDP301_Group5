import mongoose from "mongoose";

const { Schema, model } = mongoose;

const CartItemSchema = new Schema(
    {
        variantId: { type: Schema.Types.ObjectId, ref: "Variant", required: true },
        quantity: { type: Number, required: true, min: 1 },
    },
    { _id: false }
);

const CartSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },

        items: { type: [CartItemSchema], default: [] },

        updatedAt: { type: Date, default: Date.now },
    },
    { timestamps: { createdAt: false, updatedAt: false } }
);

export const Cart = model("Cart", CartSchema);
