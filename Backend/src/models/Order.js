import mongoose from "mongoose";

const { Schema, model } = mongoose;

const OrderItemSchema = new Schema(
    {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        variantId: { type: Schema.Types.ObjectId, ref: "Variant", required: true },

        productName: { type: String, required: true },
        variantLabel: { type: String, default: "" },

        price: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1 },
    },
    { _id: false }
);

const VoucherAppliedSchema = new Schema(
    {
        voucherId: { type: Schema.Types.ObjectId, ref: "Voucher" },
        code: { type: String, trim: true },

        scope: { type: String, enum: ["system", "shop"], required: true },
        shopId: { type: Schema.Types.ObjectId, ref: "Shop", default: null },

        discountType: { type: String, enum: ["percent", "fixed"], required: true },
        discountValue: { type: Number, required: true, min: 0 },

        minOrderValue: { type: Number, default: 0, min: 0 },
        maxDiscountValue: { type: Number, default: 0, min: 0 },

        appliedDiscountAmount: { type: Number, default: 0, min: 0 },
    },
    { _id: false }
);

const StatusHistorySchema = new Schema(
    {
        status: { type: String, enum: ["created", "confirmed", "shipped", "delivered", "cancelled"], required: true },
        changedAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

const OrderSchema = new Schema(
    {
        orderCode: { type: String, required: true, unique: true, index: true },

        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

        shop: { type: Schema.Types.ObjectId, ref: "Shop", required: true, index: true },

        pickupAddressSnapshotId: { type: Schema.Types.ObjectId, ref: "OrderAddressSnapshot", required: true },
        deliveryAddressSnapshotId: { type: Schema.Types.ObjectId, ref: "OrderAddressSnapshot", required: true },

        items: { type: [OrderItemSchema], required: true, default: [] },

        subtotal: { type: Number, required: true, min: 0 },
        shippingFee: { type: Number, default: 0, min: 0 },

        voucher: { type: VoucherAppliedSchema, default: null },

        totalAmount: { type: Number, required: true, min: 0 },

        paymentMethod: { type: String, default: "" },
        paymentStatus: { type: String, enum: ["unpaid", "paid"], default: "unpaid", index: true },

        orderStatus: { type: String, enum: ["created", "confirmed", "shipped", "delivered", "cancelled"], default: "created", index: true },
        trackingCode: { type: String, default: "" },

        statusHistory: { type: [StatusHistorySchema], default: [] },

        deliveredAt: { type: Date },
        cancelledAt: { type: Date },
    },
    { timestamps: true }
);

OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ shop: 1, createdAt: -1 });

export const Order = model("Order", OrderSchema);
