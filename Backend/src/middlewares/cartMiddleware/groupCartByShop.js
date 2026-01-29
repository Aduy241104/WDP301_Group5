// middlewares/groupCartByShop.middleware.js
import mongoose from "mongoose";
import { Shop } from "../../models/Shop.js";
import { StatusCodes } from "http-status-codes";

export const groupCartByShop = async (req, res, next) => {
    try {
        const payload = res.locals.cartPayload;

        if (!payload || !Array.isArray(payload.items)) {
            return res.status(StatusCodes.OK).json({
                groups: [],
                meta: { totalItems: 0 },
            });
        }

        const groupsMap = new Map();

        // Gom item theo shop
        for (const item of payload.items) {
            const shopId = item?.product?.shopId;
            if (!shopId) continue;

            const key = String(shopId);

            if (!groupsMap.has(key)) {
                groupsMap.set(key, {
                    shop: null,
                    items: [],
                    summary: {
                        totalLines: 0,
                        totalQty: 0,
                        inStockLines: 0,
                        outOfStockLines: 0,
                    },
                });
            }

            const g = groupsMap.get(key);
            g.items.push(item);

            g.summary.totalLines += 1;
            g.summary.totalQty += Number(item.quantity ?? 0);
            if (item.inStock) g.summary.inStockLines += 1;
            else g.summary.outOfStockLines += 1;
        }

        if (groupsMap.size === 0) {
            return res.status(StatusCodes.OK).json({
                groups: [],
                meta: payload.meta,
            });
        }

        // Batch query Shop
        const shopIds = Array.from(groupsMap.keys())
            .filter((id) => mongoose.isValidObjectId(id))
            .map((id) => new mongoose.Types.ObjectId(id));

        const shops = await Shop.find({ _id: { $in: shopIds } })
            .select("_id name avatar")
            .lean();

        const shopMap = new Map(shops.map((s) => [String(s._id), s]));

        // Gắn shop info + giữ thứ tự xuất hiện
        const firstIndex = new Map();
        payload.items.forEach((it, idx) => {
            const sid = String(it?.product?.shopId ?? "");
            if (sid && !firstIndex.has(sid)) firstIndex.set(sid, idx);
        });

        const groups = Array.from(groupsMap.entries())
            .map(([shopId, group]) => {
                const shop = shopMap.get(shopId);
                return {
                    shop: shop
                        ? { _id: shop._id, name: shop.name, avatar: shop.avatar }
                        : { _id: shopId, name: "[Shop not found]", avatar: "" },
                    items: group.items,
                    summary: group.summary,
                };
            })
            .sort((a, b) => {
                return (
                    (firstIndex.get(String(a.shop._id)) ?? 0) -
                    (firstIndex.get(String(b.shop._id)) ?? 0)
                );
            });

        // Optional: trong từng shop → còn hàng trước, hết hàng sau
        groups.forEach((g) => {
            g.items.sort((a, b) => Number(b.inStock) - Number(a.inStock));
        });

        // 5️⃣ RETURN RESPONSE LUÔN
        return res.status(StatusCodes.OK).json({
            groups,
            meta: payload.meta,
        });
    } catch (err) {
        return next(err);
    }
};