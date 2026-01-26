import mongoose from "mongoose";

const { Schema, model } = mongoose;

const ShopCategorySchema = new Schema(
    {
        shopId: { type: Schema.Types.ObjectId, ref: "Shop", required: true, index: true },
        name: { type: String, required: true, trim: true },

        productIds: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    },
    { timestamps: true }
);

ShopCategorySchema.index({ shopId: 1, name: 1 });

export const ShopCategory = model("ShopCategory", ShopCategorySchema);
