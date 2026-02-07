import mongoose from "mongoose";

const { Schema, model } = mongoose;

const VoucherSchema = new Schema(
    {
        scope: { type: String, enum: ["system", "shop"], required: true, index: true },
        shopId: { type: Schema.Types.ObjectId, ref: "Shop", default: null, index: true },

        code: { type: String, required: true, unique: true, index: true, trim: true },
        name: { type: String, required: true },
        description: { type: String, default: "" },

        discountType: { type: String, enum: ["percent", "fixed", "ship"], required: true },
        discountValue: { type: Number, required: true, min: 0 },

        minOrderValue: { type: Number, default: 0, min: 0 },
        maxDiscountValue: { type: Number, default: 0, min: 0 },

        startAt: { type: Date, required: true, index: true },
        endAt: { type: Date, required: true, index: true },

        usageLimitTotal: { type: Number, default: 0, min: 0 },
        usedCount: { type: Number, default: 0, min: 0 },
        usageLimitPerUser: { type: Number, default: 0, min: 0 },

        createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
        createdByRole: { type: String, enum: ["admin", "seller"], required: true },

        isDeleted: { type: Boolean, default: false, index: true },
        deletedAt: { type: Date },
        deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

VoucherSchema.index({ scope: 1, shopId: 1, code: 1 });

export const Voucher = model("Voucher", VoucherSchema);
