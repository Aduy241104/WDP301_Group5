import mongoose from "mongoose";

const { Schema, model } = mongoose;

const BannerSchema = new Schema(
    {
        // Shop banner fields (optional - for shop banners)
        shopId: {
            type: Schema.Types.ObjectId,
            ref: "Shop",
            default: null,
            index: true,
        },

        title: { type: String, required: true },
        imageUrl: { type: String, required: true },

        linkUrl: { type: String, default: "" },
        linkType: { type: String, enum: ["external", "product", "shop", "category", "search"], default: "external" },
        linkTargetId: { type: Schema.Types.ObjectId, default: null },

        // Position: admin banners use "home_top", "home_mid", "home_popup"
        // Shop banners use "top", "slider", "popup"
        position: {
            type: String,
            enum: ["home_top", "home_mid", "home_popup", "header_bottom", "top", "slider", "popup"],
            required: true,
            index: true,
        },
        priority: { type: Number, default: 0 },
        order: { type: Number, default: 0 }, // For shop banners

        startAt: { type: Date, default: null, index: true },
        endAt: { type: Date, default: null, index: true },

        isActive: { type: Boolean, default: true, index: true }, // For shop banners

        createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        updatedBy: { type: Schema.Types.ObjectId, ref: "User" },

        isDeleted: { type: Boolean, default: false, index: true },
        deletedAt: { type: Date },
        deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

BannerSchema.index({ position: 1, priority: -1, startAt: 1, endAt: 1 });
BannerSchema.index({ shopId: 1, isDeleted: 1, createdBy: 1 });

export const Banner = model("Banner", BannerSchema);

