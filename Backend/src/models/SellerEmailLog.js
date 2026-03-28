import mongoose from "mongoose";

const { Schema, model } = mongoose;

const SellerEmailLogSchema = new Schema(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    toEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    subject: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    status: {
      type: String,
      enum: ["sent", "failed"],
      default: "sent",
      index: true,
    },
    error: { type: String, default: "" },
  },
  { timestamps: true },
);

SellerEmailLogSchema.index({ sellerId: 1, createdAt: -1 });

export const SellerEmailLog = model("SellerEmailLog", SellerEmailLogSchema);

