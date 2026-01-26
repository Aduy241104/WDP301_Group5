import mongoose from "mongoose";

const { Schema, model } = mongoose;

const BannerSchema = new Schema(
    {
        title: { type: String, required: true },
        imageUrl: { type: String, required: true },

        linkUrl: { type: String, default: "" },
        linkType: { type: String, enum: ["external", "product", "shop", "category", "search"], required: true },
        linkTargetId: { type: Schema.Types.ObjectId, default: null },

        position: { type: String, enum: ["home_top", "home_mid", "home_popup"], required: true, index: true },
        priority: { type: Number, default: 0 },

        startAt: { type: Date, required: true, index: true },
        endAt: { type: Date, required: true, index: true },

        createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
        updatedBy: { type: Schema.Types.ObjectId, ref: "User" },

        isDeleted: { type: Boolean, default: false, index: true },
        deletedAt: { type: Date },
        deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

BannerSchema.index({ position: 1, priority: -1, startAt: 1, endAt: 1 });


export const Banner = model("Banner", BannerSchema);

