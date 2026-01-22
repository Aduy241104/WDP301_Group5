import React from "react";
import { Link } from "react-router-dom";

const formatVND = (value) => {
    const n = Number(value ?? 0);
    return n.toLocaleString("vi-VN") + "₫";
};

export default function ProductCard({ product }) {
    if (!product) return null;

    const img = product?.images?.[0] || "https://via.placeholder.com/400x400?text=No+Image";
    const name = product?.name || "Unnamed";
    const slug = product?.slug || product?._id; // fallback
    const price = formatVND(product?.defaultPrice);
    const rating = product?.ratingAvg ?? 0;
    const sold = product?.totalSale ?? 0;

    const shopName = product?.shop?.name || "Shop";
    const shopAvatar = product?.shop?.avatar;

    return (
        <Link
            to={ `/products/${slug}` }
            className="group block rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-lg transition overflow-hidden"
        >
            {/* Image */ }
            <div className="relative aspect-square bg-slate-50 overflow-hidden">
                <img
                    src={ img }
                    alt={ name }
                    className="h-full w-full object-cover group-hover:scale-[1.03] transition"
                    loading="lazy"
                />
                {/* Badge */ }
                <div className="absolute top-3 left-3">
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-white/90 border border-slate-200">
                        🔥 Bán chạy
                    </span>
                </div>
            </div>

            {/* Content */ }
            <div className="p-4">
                <div className="min-h-[44px]">
                    <h3 className="text-sm font-semibold text-slate-900 line-clamp-2">{ name }</h3>
                </div>

                <div className="mt-2 flex items-center justify-between">
                    <p className="text-base font-bold text-slate-900">{ price }</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                            ⭐ <span className="font-semibold text-slate-700">{ rating.toFixed(1) }</span>
                        </span>
                        <span className="h-3 w-px bg-slate-200" />
                        <span>
                            Đã bán <span className="font-semibold text-slate-700">{ sold }</span>
                        </span>
                    </div>
                </div>

                {/* Shop */ }
                <div className="mt-3 flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                        { shopAvatar ? (
                            <img src={ shopAvatar } alt={ shopName } className="h-full w-full object-cover" />
                        ) : null }
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1">
                        { shopName }
                    </p>
                </div>

                {/* Categories */ }
                { Array.isArray(product?.productCategory) && product.productCategory.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                        { product.productCategory.slice(0, 2).map((c) => (
                            <span
                                key={ c?._id || c?.name }
                                className="text-[11px] px-2 py-1 rounded-full border border-slate-200 text-slate-600 bg-slate-50"
                            >
                                { c?.name }
                            </span>
                        )) }
                    </div>
                ) : null }
            </div>
        </Link>
    );
}
