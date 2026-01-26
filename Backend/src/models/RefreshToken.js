import mongoose from "mongoose";
const { Schema, model } = mongoose;

const RefreshTokenSchema = new Schema(
    {
        // 1 user = 1 refresh token record
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true,
        },

        // Lưu HASH của refresh token (không lưu token thô)
        tokenHash: { type: String, required: true },

        // Hết hạn refresh token
        expiresAt: { type: Date, required: true, index: true },
    },
    { timestamps: true }
);

// TTL: tự xoá document khi expiresAt < now
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = model("RefreshToken", RefreshTokenSchema);
