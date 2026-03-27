import React, { useEffect, useState } from "react";

export default function OrderSearchBar({ value, onChange }) {
    const [local, setLocal] = useState(value || "");

    useEffect(() => setLocal(value || ""), [value]);

    const handleClear = () => {
        setLocal("");
        onChange(""); // Reset tìm kiếm về rỗng
    };

    return (
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:ring-1 focus-within:ring-slate-300 transition-all">
            <span className="text-slate-400">🔎</span>
            <input
                value={ local }
                onChange={ (e) => setLocal(e.target.value) }
                onKeyDown={ (e) => {
                    if (e.key === "Enter") onChange(local.trim());
                } }
                placeholder="Tìm theo ID đơn hàng hoặc Tên Sản phẩm"
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />

            {/* Nút Xóa nhanh từ khóa */ }
            { local && (
                <button
                    onClick={ handleClear }
                    className="text-slate-400 hover:text-slate-600 px-1"
                >
                    ✕
                </button>
            ) }

            <button
                onClick={ () => onChange(local.trim()) }
                className="rounded-xl bg-white px-4 py-1.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 active:bg-slate-100 transition-colors"
            >
                Tìm
            </button>
        </div>
    );
}