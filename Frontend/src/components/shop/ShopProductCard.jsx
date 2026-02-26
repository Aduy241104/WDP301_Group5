import React from "react";
import { Link } from "react-router-dom";

const formatVND = (value) => {
  const n = Number(value ?? 0);
  return n.toLocaleString("vi-VN") + "₫";
};

export default function ShopProductCard({ product }) {
  if (!product) return null;

  const id = product._id;
  const img =
    product?.images?.[0] ||
    "https://via.placeholder.com/400x400?text=No+Image";
  const name = product?.name || "Unnamed";
  const price = formatVND(product?.defaultPrice);
  const rating = product?.ratingAvg ?? 0;
  const sold = product?.totalSale ?? 0;

  return (
    <Link
      to={`/products-detail/${id}`}
      className="group block rounded-lg bg-white border border-slate-100 
      shadow-sm hover:shadow transition overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-square bg-slate-50 overflow-hidden">
        <img
          src={img}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />

      </div>

      {/* Content */}
      <div className="p-2.5">
        <h3 className="text-[12px] font-semibold text-slate-900 line-clamp-2 min-h-[32px]">
          {name}
        </h3>

        <p className="mt-1 text-[13px] font-bold text-slate-900">{price}</p>

        <div className="mt-0.5 flex items-center gap-2 text-[10px] text-slate-500">
          <span className="flex items-center gap-0.5">
            ⭐{" "}
            <span className="font-semibold text-slate-700">
              {rating.toFixed(1)}
            </span>
          </span>
          <span className="h-2.5 w-px bg-slate-200" />
          <span>{sold} đã bán online</span>
        </div>
      </div>
    </Link>
  );
}
