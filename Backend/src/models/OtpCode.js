import mongoose from "mongoose";

const { Schema, model } = mongoose;

const OtpCodeSchema = new Schema(
    {
        target: { type: String, required: true, index: true }, // phone/email
        type: { type: String, enum: ["register", "login", "reset_password"], required: true, index: true },
        code: { type: String, required: true }, // thường 6 số
        expiredAt: { type: Date, required: true, index: true },
        createdAt: { type: Date, default: Date.now, index: true },
    },
    { timestamps: { createdAt: false, updatedAt: false } }
);

// Optional: tránh spam OTP quá nhanh theo cùng target+type+code
OtpCodeSchema.index({ target: 1, type: 1, code: 1 });

export const OtpCode = model("OtpCode", OtpCodeSchema);
