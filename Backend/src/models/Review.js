import mongoose from "mongoose";

const { Schema, model } = mongoose;

const SellerReplySchema = new Schema(
    {
        shopId: { type: Schema.Types.ObjectId, ref: "Shop" },
        message: { type: String, default: "" },
        createdAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

const ReviewSchema = new Schema(
    {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, default: "" },

        sellerReply: { type: SellerReplySchema, default: null },

        isDeleted: { type: Boolean, default: false, index: true },
        deletedAt: { type: Date },
    },
    { timestamps: true }
);

ReviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

export const Review = model("Review", ReviewSchema);
