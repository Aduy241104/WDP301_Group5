import mongoose from "mongoose";

const { Schema, model } = mongoose;

const UserAddressSchema = new Schema(
    {
        province: { type: String, required: true },
        district: { type: String, required: true },
        ward: { type: String, required: true },
        streetAddress: { type: String, required: true },
        fullAddress: { type: String, required: true },
        isDefault: { type: Boolean, default: false },
    },
    { _id: true }
);

const UserSchema = new Schema(
    {
        email: { type: String, required: true, unique: true, index: true, trim: true, lowercase: true },
        password: { type: String, required: true },
        fullName: { type: String, required: true, trim: true },
        avatar: { type: String, default: "" },
        phone: { type: String, default: "", index: true },
        gender: { type: String, enum: ["male", "female", "other"], default: "other" },
        dateOfBirth: { type: Date },

        role: { type: String, enum: ["user", "seller", "admin"], default: "user", index: true },
        status: { type: String, enum: ["active", "blocked"], default: "active", index: true },

        addresses: { type: [UserAddressSchema], default: [] },

        wishlist: [{ type: Schema.Types.ObjectId, ref: "Product", index: true }],
    },
    { timestamps: true }
);

export const User = model("User", UserSchema);
