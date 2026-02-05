import mongoose from "mongoose";
const { Schema, model } = mongoose;

const UserProductEventSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

        eventType: {
            type: String,
            enum: ["view_detail", "wishlist", "add_to_cart"],
            required: true,
            index: true,
        },

        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },

        categorySchemaId: { type: Schema.Types.ObjectId, ref: "CategorySchema", index: true },
        brandId: { type: Schema.Types.ObjectId, ref: "Brand", index: true },
        shopId: { type: Schema.Types.ObjectId, ref: "Shop", index: true },

        createdAt: { type: Date, default: Date.now, index: true },
    },
    { timestamps: false }
);

UserProductEventSchema.index({ userId: 1, createdAt: -1 });
UserProductEventSchema.index({ userId: 1, eventType: 1, createdAt: -1 });
UserProductEventSchema.index({ productId: 1, createdAt: -1 });

export const UserProductEvent = model("UserProductEvent", UserProductEventSchema);
