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

const ShopPickupAddressSchema = new Schema(
    
    {
        province: { type: String, required: true },
        district: { type: String, required: true },
        ward: { type: String, required: true },
        streetAddress: { type: String, required: true },
        fullAddress: { type: String, required: true },

        isDefault: { type: Boolean, default: false },

        isDeleted: { type: Boolean, default: false, index: true },
        deletedAt: { type: Date },
    },
    { _id: true }
);

const ShopSchema = new Schema(
    {
        ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

        name: { type: String, required: true, trim: true },
        avatar: { type: String, default: "" },
        description: { type: String, default: "" },
        contactPhone: { type: String, default: "", trim: true },

        status: { type: String, enum: ["pending", "approved", "blocked"], default: "pending", index: true },
        isBlockedByAdmin: { type: Boolean, default: false },

        shopAddress: { type: ShopAddressSchema, required: true },

        shopPickupAddresses: { type: [ShopPickupAddressSchema], default: [] },

        isDeleted: { type: Boolean, default: false, index: true },
        deletedAt: { type: Date },
        deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

export const Shop = model("Shop", ShopSchema);
