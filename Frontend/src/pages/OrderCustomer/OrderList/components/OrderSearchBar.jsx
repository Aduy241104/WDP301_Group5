import React, { useEffect, useState } from "react";

export default function OrderSearchBar({ value, onChange }) {
    const [local, setLocal] = useState(value || "");

    useEffect(() => setLocal(value || ""), [value]);

    return (
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
            <span className="text-slate-400">🔎</span>
            <input
                value={ local }
                onChange={ (e) => setLocal(e.target.value) }
                onKeyDown={ (e) => {
                    if (e.key === "Enter") onChange(local);
                } }
                placeholder="Bạn có thể tìm kiếm theo tên Shop, ID đơn hàng hoặc Tên Sản phẩm"
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
            <button
                onClick={ () => onChange(local) }
                className="rounded-xl bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
            >
                Tìm
            </button>
        </div>
    );
}
