import mongoose from "mongoose";

const { Schema, model } = mongoose;

const BrandSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    logo: { type: String, default: "" },
    description: { type: String, default: "" },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "CategorySchema",
      required: true,
      index: true,
    },

    isActive: { type: Boolean, default: true },

    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },

  
);

export const Brand = model("Brand", BrandSchema);
