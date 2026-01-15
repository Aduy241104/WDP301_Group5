import mongoose from "mongoose";

const { Schema, model } = mongoose;

const ContactSchema = new Schema(
    {
        name: { type: String, required: true },
        phone: { type: String, required: true },
    },
    { _id: false }
);

const AddressSchema = new Schema(
    {
        province: { type: String, required: true },
        district: { type: String, required: true },
        ward: { type: String, required: true },
        streetAddress: { type: String, required: true },
        fullAddress: { type: String, required: true },
    },
    { _id: false }
);

const OrderAddressSnapshotSchema = new Schema(
    {
        orderId: { type: Schema.Types.ObjectId, ref: "Order", index: true },
        type: { type: String, enum: ["pickup", "delivery"], required: true, index: true },

        contact: { type: ContactSchema, required: true },
        address: { type: AddressSchema, required: true },

        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: { createdAt: false, updatedAt: false } }
);

OrderAddressSnapshotSchema.index({ orderId: 1, type: 1 });

export const OrderAddressSnapshot = model("OrderAddressSnapshot", OrderAddressSnapshotSchema);
