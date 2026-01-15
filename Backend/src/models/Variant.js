import mongoose from "mongoose";

const { Schema, model } = mongoose;

const VariantSchema = new Schema(
    {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },

        sku: { type: String, required: true, trim: true, index: true },
        size: { type: String, default: "" }, // có thể rỗng nếu sản phẩm không có size
        price: { type: Number, required: true, min: 0 },

        status: { type: String, enum: ["active", "inactive"], default: "active", index: true },

        isDeleted: { type: Boolean, default: false, index: true },
        deletedAt: { type: Date },
        deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

VariantSchema.index({ productId: 1, sku: 1 }, { unique: true });

export const Variant = model("Variant", VariantSchema);
