import React, { useEffect, useRef, useState } from "react";

export default function QuantityControl({ value, stock, disabled, onChange }) {
    const [draft, setDraft] = useState(String(value));
    const debounceRef = useRef(null);

    // sync khi value từ ngoài thay đổi (sau refetch)
    useEffect(() => {
        setDraft(String(value));
    }, [value]);

    const clamp = (n) => {
        let x = Number(n);
        if (!Number.isFinite(x)) x = 1;
        x = Math.max(1, x);
        if (stock > 0) x = Math.min(x, stock);
        return x;
    };

    // gọi API (onChange) với debounce 1s
    const scheduleCommit = (nextQty) => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            onChange(nextQty);
        }, 1000);
    };

    const handleDraftChange = (next) => {
        const nextQty = clamp(next);
        setDraft(String(nextQty));
        scheduleCommit(nextQty);
    };

    // commit ngay (blur / enter)
    const commitNow = () => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
            debounceRef.current = null;
        }

        const nextQty = clamp(draft);
        setDraft(String(nextQty));
        onChange(nextQty);
    };

    // cleanup khi unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    return (
        <div className="inline-flex items-center rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <button
                disabled={ disabled }
                onClick={ () => handleDraftChange(Number(draft) - 1) }
                className="h-10 w-10 grid place-items-center text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
                −
            </button>

            <input
                value={ draft }
                disabled={ disabled }
                onChange={ (e) => setDraft(e.target.value) }
                onBlur={ commitNow }
                onKeyDown={ (e) => e.key === "Enter" && commitNow() }
                className="h-10 w-14 text-center text-sm outline-none border-x border-slate-200"
                inputMode="numeric"
            />

            <button
                disabled={ disabled }
                onClick={ () => handleDraftChange(Number(draft) + 1) }
                className="h-10 w-10 grid place-items-center text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
                +
            </button>
        </div>
    );
}
