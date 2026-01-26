import mongoose from "mongoose";

const { Schema, model } = mongoose;

const VoucherUsageSchema = new Schema(
    {
        voucherId: { type: Schema.Types.ObjectId, ref: "Voucher", required: true, index: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true, index: true },

        usedAt: { type: Date, default: Date.now },
    },
    { timestamps: { createdAt: false, updatedAt: false } }
);

VoucherUsageSchema.index({ voucherId: 1, userId: 1 }, { unique: true });

export const VoucherUsage = model("VoucherUsage", VoucherUsageSchema);
