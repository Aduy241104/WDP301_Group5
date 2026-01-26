import mongoose from "mongoose";

const { Schema, model } = mongoose;

const ProductAttributeSchema = new Schema(
    {
        key: { type: String, required: true },
        value: { type: Schema.Types.Mixed, required: true },
    },
    { _id: false }
);

const ProductSchema = new Schema(
    {
        shopId: { type: Schema.Types.ObjectId, ref: "Shop", required: true, index: true },
        shopCategoryId: { type: Schema.Types.ObjectId, ref: "ShopCategory", required: true, index: true },

        brandId: { type: Schema.Types.ObjectId, ref: "Brand", required: true, index: true },
        categorySchemaId: { type: Schema.Types.ObjectId, ref: "CategorySchema", required: true, index: true },

        name: { type: String, required: true, trim: true },
        slug: { type: String, required: true, trim: true, lowercase: true, index: true },
        description: { type: String, default: "" },
        origin: { type: String, default: "" },
        images: [{ type: String, default: "" }],

        // theo mô tả bạn ghi: Map<String, any>
        attributes: { type: Map, of: Schema.Types.Mixed, default: {} },

        defaultPrice: { type: Number, required: true, min: 0 },

        ratingAvg: { type: Number, default: 0, min: 0, max: 5 },
        totalSale: { type: Number, default: 0 },

        status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
        rejectReason: { type: String, default: "" },

        activeStatus: { type: String, enum: ["active", "inactive"], default: "active" },
        inactiveBy: { type: String, enum: ["admin", "seller"], default: null },
        inactiveReason: { type: String, default: "" },
        inactiveAt: { type: Date },
        inactiveActorId: { type: Schema.Types.ObjectId, ref: "User" },

        publishedAt: { type: Date },

        isDeleted: { type: Boolean, default: false, index: true },
        deletedAt: { type: Date },
        deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

ProductSchema.index({ shopId: 1, slug: 1 }, { unique: true });

export const Product = model("Product", ProductSchema);
