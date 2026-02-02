import React from "react";
import ProductCard from "../product/ProductCard";
import { useNavigate } from "react-router-dom";

export default function TopSaleSection({ items = [], title = "Sản phẩm bán chạy", subtitle = "Top sản phẩm được mua nhiều nhất" }) {
    const navigate = useNavigate();
    return (
        <section className="mt-8">
            <div className="flex items-end justify-between gap-3 mb-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">{ title }</h2>
                    <p className="text-sm text-slate-500 mt-1">{ subtitle }</p>
                </div>

                <button
                    className="text-sm font-semibold px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
                    onClick={ () => navigate("/top-sale") }
                >
                    Xem thêm
                </button>
            </div>

            { items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
                    <p className="text-slate-600">Chưa có sản phẩm bán chạy.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    { items.map((p) => (
                        <ProductCard key={ p?._id } product={ p } />
                    )) }
                </div>
            ) }
        </section>
    );
}
