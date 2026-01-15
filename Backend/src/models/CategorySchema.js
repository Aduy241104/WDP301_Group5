import mongoose from "mongoose";

const { Schema, model } = mongoose;

const CategorySchemaSchema = new Schema(
    {
        name: { type: String, required: true, trim: true, index: true },

        isActive: { type: Boolean, default: true },

        isDeleted: { type: Boolean, default: false, index: true },
        deletedAt: { type: Date },
        deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

export const CategorySchema = model("CategorySchema", CategorySchemaSchema);
