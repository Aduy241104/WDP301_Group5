// src/seeds/seedVariantsInventories.js
import mongoose from "mongoose";
import { Variant } from "../models/Variant.js";
import { Inventory } from "../models/Inventory.js";

/**
 * Cách chạy:
 * 1) set MONGODB_URI trong .env (hoặc export trong terminal)
 * 2) node src/seeds/seedVariantsInventories.js
 *
 * Lưu ý:
 * - Script dùng upsert để chạy nhiều lần không bị duplicate (dựa trên unique index {productId, sku}).
 * - Inventory unique theo variantId -> upsert theo variantId.
 */

const MONGODB_URI = "mongodb://127.0.0.1:27017/StoreOnlineDB";

const PRODUCT_IDS = [
    "698413c22a38abc5cf0e8e2e",
    "698413c22a38abc5cf0e8e2f",
    "698413c22a38abc5cf0e8e30",
    "698413c22a38abc5cf0e8e31",
    "698413c22a38abc5cf0e8e32",
    "698413c22a38abc5cf0e8e33",
    "698413c22a38abc5cf0e8e34",
    "698413c22a38abc5cf0e8e35",
    "698413c22a38abc5cf0e8e36",
    "698413c22a38abc5cf0e8e37",
    "698413c22a38abc5cf0e8e38",
    "698413c22a38abc5cf0e8e39",
    "698413c22a38abc5cf0e8e3a",
    "698413c22a38abc5cf0e8e3b",
    "698413c22a38abc5cf0e8e3c",
    "698413c22a38abc5cf0e8e3d",
    "698413c22a38abc5cf0e8e3e",
    "698413c22a38abc5cf0e8e3f",
    "698413c22a38abc5cf0e8e40",
    "698413c22a38abc5cf0e8e41",
    "698413c22a38abc5cf0e8e42",
    "698413c22a38abc5cf0e8e43",
    "698413c22a38abc5cf0e8e44",
    "698413c22a38abc5cf0e8e45",
    "698413c22a38abc5cf0e8e46",
    "698413c22a38abc5cf0e8e47",
    "698413c22a38abc5cf0e8e48",
    "698413c22a38abc5cf0e8e49",
    "698413c22a38abc5cf0e8e4a",
    "698413c22a38abc5cf0e8e4b",
];

// tuỳ bạn chỉnh size list (nếu sản phẩm không có size thì để [""] thôi)
const SIZES = ["S", "M", "L"];

// random int helper
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const buildSku = (productId, size) => {
    // sku ngắn + dễ đọc: VAR-<8 ký tự đầu>-<size>
    const short = productId.slice(0, 8);
    return `VAR-${short}-${size || "NOSIZE"}`;
};

async function main() {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected:", MONGODB_URI);

    // 1) Tạo/upsert variants
    const variantOps = [];
    for (const pid of PRODUCT_IDS) {
        const productId = new mongoose.Types.ObjectId(pid);

        // basePrice random theo product (để 3 size lệch nhau)
        const basePrice = randInt(79, 699) * 1000; // 79k -> 699k

        for (let i = 0; i < SIZES.length; i++) {
            const size = SIZES[i];
            const sku = buildSku(pid, size);

            // lệch giá theo size: S -10k, M +0, L +20k
            const price = basePrice + (size === "S" ? -10_000 : size === "L" ? 20_000 : 0);

            variantOps.push({
                updateOne: {
                    filter: { productId, sku },
                    update: {
                        $set: {
                            productId,
                            sku,
                            size,
                            price,
                            status: "active",
                            isDeleted: false,
                            deletedAt: null,
                            deletedBy: null,
                        },
                    },
                    upsert: true,
                },
            });
        }
    }

    const variantBulkRes = await Variant.bulkWrite(variantOps, { ordered: false });
    console.log("✅ Variants upserted:", {
        upserted: variantBulkRes.upsertedCount,
        modified: variantBulkRes.modifiedCount,
        matched: variantBulkRes.matchedCount,
    });

    // 2) Lấy lại variants vừa tạo để seed inventory
    const productObjectIds = PRODUCT_IDS.map((x) => new mongoose.Types.ObjectId(x));
    const variants = await Variant.find({
        productId: { $in: productObjectIds },
        isDeleted: false,
    })
        .select("_id productId sku size price")
        .lean();

    console.log("ℹ️ Variants found for inventory:", variants.length);

    // 3) Tạo/upsert inventories theo variantId (unique)
    const invOps = variants.map((v) => {
        const stock = randInt(0, 50);
        const threshold = randInt(0, 10);
        return {
            updateOne: {
                filter: { variantId: v._id },
                update: {
                    $set: {
                        variantId: v._id,
                        stock,
                        threshold,
                        updatedAt: new Date(),
                    },
                },
                upsert: true,
            },
        };
    });

    const invBulkRes = await Inventory.bulkWrite(invOps, { ordered: false });
    console.log("✅ Inventories upserted:", {
        upserted: invBulkRes.upsertedCount,
        modified: invBulkRes.modifiedCount,
        matched: invBulkRes.matchedCount,
    });

    console.log("🎉 Done seed Variant + Inventory!");
    await mongoose.disconnect();
}

main().catch(async (err) => {
    console.error("❌ Seed error:", err);
    try {
        await mongoose.disconnect();
    } catch { }
    process.exit(1);
});
