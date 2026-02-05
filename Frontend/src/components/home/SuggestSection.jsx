import React from "react";
import ProductCard from "../product/ProductCard";

export default function SuggestSection({ items = [] }) {
    return (
        <section className="mt-10">
            <div className="mb-4">
                <h2 className="text-xl font-bold text-slate-900">Gợi ý cho bạn</h2>
                <p className="text-sm text-slate-500 mt-1">Có thể bạn sẽ thích những sản phẩm này</p>
            </div>

            { items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
                    <p className="text-slate-600">Chưa có gợi ý. Hãy xem vài sản phẩm để hệ thống gợi ý tốt hơn.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                    { items.map((p) => (
                        <div className="">
                            <ProductCard key={ p?._id } product={ p } />
                        </div>
                    )) }
                </div>
            ) }
        </section>
    );
}
