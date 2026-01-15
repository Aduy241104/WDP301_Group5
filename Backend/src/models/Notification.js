import mongoose from "mongoose";

const { Schema, model } = mongoose;

const NotificationDataSchema = new Schema(
    {
        orderCode: { type: String, default: "" },
        status: { type: String, enum: ["created", "confirmed", "shipped", "delivered", "cancelled"] },
    },
    { _id: false }
);

const NotificationSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

        type: { type: String, enum: ["order_status"], required: true, index: true },
        title: { type: String, required: true },
        message: { type: String, required: true },

        orderId: { type: Schema.Types.ObjectId, ref: "Order", index: true },
        data: { type: NotificationDataSchema, default: null },

        isRead: { type: Boolean, default: false, index: true },

        isDeleted: { type: Boolean, default: false, index: true },
        deletedAt: { type: Date },

        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: { createdAt: false, updatedAt: false } }
);

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export const Notification = model("Notification", NotificationSchema);
