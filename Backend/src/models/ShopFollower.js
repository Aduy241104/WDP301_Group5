import mongoose from "mongoose";

const { Schema, model } = mongoose;

const ShopFollowerSchema = new Schema(
    {
        shopId: { type: Schema.Types.ObjectId, ref: "Shop", required: true, index: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

ShopFollowerSchema.index({ shopId: 1, userId: 1 }, { unique: true });

export const ShopFollower = model("ShopFollower", ShopFollowerSchema);
