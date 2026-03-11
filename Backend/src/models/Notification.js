import mongoose from "mongoose";

const { Schema, model } = mongoose;

const NotificationDataSchema = new Schema(
  {
    orderCode: { type: String, default: "" },
    status: {
      type: String,
      enum: ["created", "confirmed", "shipped", "delivered", "cancelled", null],
      default: null,
    },
    url: { type: String, default: "" },

    // thêm cho report result
    reportCode: { type: String, default: "" },
    reportResult: { type: String, default: "" },
    reportReason: { type: String, default: "" },
  },
  { _id: false },
);

const NotificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["order_status", "system", "report_result"],
      required: true,
      index: true,
    },

    title: { type: String, required: true },
    message: { type: String, required: true },

    orderId: { type: Schema.Types.ObjectId, ref: "Order", index: true },

    // thêm cho report
    reportId: { type: Schema.Types.ObjectId, ref: "Report", default: null, index: true },

    // thêm để biết notification này nhắm tới ai
    targetRole: {
      type: String,
      enum: ["customer", "seller", "admin", null],
      default: null,
      index: true,
    },

    // thêm để đánh dấu gửi hàng loạt cho seller
    isBroadcast: { type: Boolean, default: false, index: true },

    data: { type: NotificationDataSchema, default: null },

    isRead: { type: Boolean, default: false, index: true },

    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },

    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: false, updatedAt: false } },
);

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export const Notification = model("Notification", NotificationSchema);