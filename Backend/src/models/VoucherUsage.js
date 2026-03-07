import mongoose from "mongoose";

const { Schema, model } = mongoose;

const VoucherUsageSchema = new Schema(
    {
        voucherId: { type: Schema.Types.ObjectId, ref: "Voucher", required: true,  },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true,  },
        orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true, },

        usedAt: { type: Date, default: Date.now, index: true },
    },
    { timestamps: { createdAt: false, updatedAt: false } }
);



// (Optional) query nhanh theo order
VoucherUsageSchema.index({ orderId: 1, voucherId: 1 });

export const VoucherUsage = model("VoucherUsage", VoucherUsageSchema);