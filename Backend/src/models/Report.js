import mongoose from "mongoose";

const { Schema, model } = mongoose;

const TargetSnapshotSchema = new Schema(
    {
        name: { type: String, default: "" },
        slug: { type: String, default: "" },
        shopId: { type: Schema.Types.ObjectId, ref: "Shop", default: null },
    },
    { _id: false }
);

const TimelineSchema = new Schema(
    {
        action: { type: String, enum: ["created", "closed", "reopened", "updated_category", "noted"], required: true },
        actorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        note: { type: String, default: "" },
        at: { type: Date, default: Date.now },
    },
    { _id: false }
);

const ReportSchema = new Schema(
    {
        reporterId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

        targetType: { type: String, enum: ["shop", "product", "user"], required: true, index: true },
        targetId: { type: Schema.Types.ObjectId, required: true, index: true },
        targetSnapshot: { type: TargetSnapshotSchema, default: null },

        category: { type: String, enum: ["spam", "fake", "copyright", "scam", "abuse", "other"], required: true },
        reason: { type: String, required: true },
        description: { type: String, default: "" },
        images: [{ type: String, default: "" }],

        status: { type: String, enum: ["open", "closed", "reopened"], default: "open", index: true },
        adminNote: { type: String, default: "" },

        timeline: { type: [TimelineSchema], default: [] },

        isDeleted: { type: Boolean, default: false, index: true },
        deletedAt: { type: Date },
        deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

ReportSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });

export const Report = model("Report", ReportSchema);
