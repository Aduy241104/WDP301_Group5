import mongoose from "mongoose";

const { Schema, model } = mongoose;

const InventorySchema = new Schema(
    {
        variantId: { type: Schema.Types.ObjectId, ref: "Variant", required: true, unique: true, index: true },

        stock: { type: Number, default: 0, min: 0 },
        threshold: { type: Number, default: 0, min: 0 },

        updatedAt: { type: Date, default: Date.now },
    },
    { timestamps: { createdAt: false, updatedAt: false } }
);

export const Inventory = model("Inventory", InventorySchema);
