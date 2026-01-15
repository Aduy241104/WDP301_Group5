import mongoose from "mongoose";

const { Schema, model } = mongoose;

const ShopAddressSchema = new Schema(
    {
        province: { type: String, required: true },
        district: { type: String, required: true },
        ward: { type: String, required: true },
        streetAddress: { type: String, required: true },
        fullAddress: { type: String, required: true },
    },
    { _id: false }
);

const SellerRequestSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

        shopName: { type: String, required: true, trim: true },
        description: { type: String, default: "" },
        contactPhone: { type: String, required: true },

        shopAddress: { type: ShopAddressSchema, required: true },

        taxCode: { type: String, default: "" },
        cccdImages: [{ type: String, default: "" }],

        status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
        rejectReason: { type: String, default: "" },

        isDeleted: { type: Boolean, default: false, index: true },
        deletedAt: { type: Date },
        deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

export const SellerRequest = model("SellerRequest", SellerRequestSchema);
