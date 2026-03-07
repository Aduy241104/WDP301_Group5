import React from "react";
import ProductCard from "../product/ProductCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLightbulb } from "@fortawesome/free-solid-svg-icons";


export default function SuggestSection({ items = [] }) {
    return (
        <section className="mt-12 bg-slate-50 rounded-2xl p-6">
            {/* Header */ }
            <div className="flex items-center justify-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex justify-center items-center gap-3">
                        <FontAwesomeIcon
                            icon={ faLightbulb }
                            className="text-500 text-xl"
                        />
                        Gợi ý cho bạn
                    </h2>

                    <p className="text-sm text-slate-500 mt-1">
                        Có thể bạn sẽ thích những sản phẩm này
                    </p>
                </div>
            </div>

            {/* Content */ }
            { items.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
                    <p className="text-slate-600 text-sm">
                        Chưa có gợi ý. Hãy xem vài sản phẩm để hệ thống gợi ý tốt hơn.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    { items.map((p) => (
                        <div
                            key={ p?._id }
                            className="transition-transform duration-200 hover:-translate-y-1"
                        >
                            <ProductCard product={ p } />
                        </div>
                    )) }
                </div>
            ) }
        </section>
    );
}
