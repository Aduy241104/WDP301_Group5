import mongoose from "mongoose";
const { Schema, model } = mongoose;

const ShopBannerSchema = new Schema(
    {
        shopId: {
            type: Schema.Types.ObjectId,
            ref: "Shop",
            required: true,
            index: true,
        },

        title: { type: String, default: "" },

        imageUrl: {
            type: String,
            required: true,
        },

        linkUrl: {
            type: String,
            default: "", // link đến product / collection / external
        },

        position: {
            type: String,
            enum: ["top", "slider", "popup"],
            default: "top",
            index: true,
        },

        order: {
            type: Number,
            default: 0, // thứ tự hiển thị
        },

        startAt: { type: Date, default: null },
        endAt: { type: Date, default: null },

        isActive: { type: Boolean, default: true, index: true },

        isDeleted: { type: Boolean, default: false, index: true },
        deletedAt: { type: Date },
        deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

export const ShopBanner = model("ShopBanner", ShopBannerSchema);
