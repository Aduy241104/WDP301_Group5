import React, { useMemo, useState, useContext } from "react";
import { useAuth } from "../../context/AuthContext";

export default function Header() {
    const { isAuthenticated, user, logout } = useAuth();

    const role = user?.role ?? "guest";
    const [query, setQuery] = useState("");
    const cartCount = 3; // TODO: lấy từ store/API

    const greeting = useMemo(() => {
        if (!isAuthenticated) return "Xin chào!";
        return `Hi, ${user?.fullName || user?.email || "bạn"}`;
    }, [isAuthenticated, user]);

    const go = (path) => {
        // Tnếu dùng react-router thì thay bằng navigate(path)
        window.location.href = path;
    };

    const onSearch = (e) => {
        e.preventDefault();
        console.log("Search:", query);
        // TODO: go(`/search?q=${encodeURIComponent(query)}`)
    };

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-100">
            {/* top strip */ }
            <div className="bg-[rgb(119,226,242)]/25">
                <div className="mx-auto max-w-7xl px-4 py-2 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex h-2 w-2 rounded-full bg-[rgb(119,226,242)]" />
                        <span className="text-slate-700">
                            Freeship đơn từ 199k • Đổi trả 7 ngày • Thanh toán an toàn
                        </span>
                    </div>

                    <div className="hidden sm:flex items-center gap-4 text-slate-700">
                        <button className="hover:opacity-80" onClick={ () => go("/support") }>
                            Hỗ trợ
                        </button>

                        <button className="hover:opacity-80" onClick={ () => go("/orders") }>
                            Theo dõi đơn
                        </button>

                        <button className="hover:opacity-80" onClick={ () => go("/deals") }>
                            Khuyến mãi
                        </button>

                        {/* Login đưa lên đây */ }
                        { !isAuthenticated && (
                            <button
                                onClick={ () => go("/login") }
                                className="ml-1 inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1.5 text-white font-semibold hover:opacity-90 transition"
                            >
                                Đăng nhập
                            </button>
                        ) }
                    </div>
                </div>
            </div>

            {/* main header */ }
            <div className="mx-auto max-w-7xl px-4 py-4 flex items-center gap-3">
                {/* LEFT */ }
                <div className="flex items-center gap-3">
                    {/* seller shop button (bên trái) */ }
                    { isAuthenticated && role === "seller" && (
                        <button
                            onClick={ () => go("/seller/shop") }
                            className="hidden md:inline-flex items-center gap-2 rounded-2xl px-4 py-2 bg-white border border-slate-200 shadow-sm hover:shadow transition"
                            title="Đi đến cửa hàng của bạn"
                        >
                            <span className="h-2.5 w-2.5 rounded-full bg-[rgb(119,226,242)]" />
                            <span className="font-semibold">Cửa hàng</span>
                        </button>
                    ) }

                    {/* logo */ }
                    <button onClick={ () => go("/") } className="flex items-center gap-2 select-none">
                        <div className="h-10 w-10 rounded-2xl bg-[rgb(119,226,242)] shadow-sm" />
                        <div className="leading-tight text-left">
                            <div className="text-lg font-extrabold tracking-tight">
                                Uni<span className="text-[rgb(119,226,242)]">Trade</span>
                            </div>
                            <div className="text-xs text-slate-500 -mt-0.5">Marketplace</div>
                        </div>
                    </button>
                </div>

                {/* CENTER - search */ }
                <form onSubmit={ onSearch } className="flex-1 px-6">
                    {/* giảm height: py-1.5 + input h-9 */ }
                    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white shadow-sm px-3 py-1 focus-within:ring-2 focus-within:ring-[rgb(119,226,242)]/40">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-slate-500">
                            <path
                                d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                                stroke="currentColor"
                                strokeWidth="2"
                            />
                            <path
                                d="M16.5 16.5 21 21"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>

                        <input
                            value={ query }
                            onChange={ (e) => setQuery(e.target.value) }
                            placeholder="Tìm sản phẩm, shop, thương hiệu…"
                            className="w-full h-9 outline-none text-sm bg-transparent"
                        />

                        {/* nút submit dùng icon thay text */ }
                        <button
                            type="submit"
                            className="inline-flex h-9 w-12 items-center justify-center rounded-xl bg-[rgb(119,226,242)] text-slate-900 font-semibold hover:opacity-90 transition"
                            aria-label="Tìm kiếm"
                            title="Tìm kiếm"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                />
                                <path
                                    d="M16.5 16.5 21 21"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </button>
                    </div>
                </form>

                {/* RIGHT - actions */ }
                <div className="flex items-center gap-2">
                    {/* cart */ }
                    <button
                        onClick={ () => go("/cart") }
                        className="relative px-3 py-2 bg-white"
                        title="Giỏ hàng"
                    >
                        <div className="flex items-center gap-2">
                            <svg width="29" height="29" viewBox="0 0 24 24" fill="none" className="text-slate-700">
                                <path
                                    d="M6 7h15l-2 10H8L6 7Z"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinejoin="round"
                                />
                                <path d="M6 7 5 4H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                <path d="M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" fill="currentColor" />
                                <path d="M18 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" fill="currentColor" />
                            </svg>
                        </div>
                    </button>

                    {/* profile (chỉ hiện khi login) */ }
                    { isAuthenticated && (
                        <div className="relative group">
                            <button className="rounded-2xl px-3 py-2 border border-slate-200 bg-white shadow-sm hover:shadow transition">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-xl bg-[rgb(119,226,242)]/40 border border-slate-200 overflow-hidden flex items-center justify-center">
                                        <span className="text-sm font-extrabold text-slate-800">
                                            { (user?.fullName?.[0] || user?.email?.[0] || "U").toUpperCase() }
                                        </span>
                                    </div>
                                    <div className="hidden md:block text-left">
                                        <div className="text-sm font-bold leading-tight">{ greeting }</div>
                                        <div className="text-xs text-slate-500 -mt-0.5">
                                            { role === "seller" ? "Người bán" : role === "admin" ? "Quản trị" : "Khách hàng" }
                                        </div>
                                    </div>
                                    <svg width="16" height="16" viewBox="0 0 24 24" className="text-slate-600 hidden sm:block">
                                        <path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                </div>
                            </button>

                            {/* dropdown */ }
                            <div className="
                             absolute right-0 mt-1 w-56 rounded-2xl
                             border border-slate-200 bg-white shadow-lg
                             opacity-0 pointer-events-none translate-y-1
                             group-hover:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0 transition
                             before:content-['']
                             before:absolute
                             before:-top-2
                             before:left-0
                             before:w-full
                             before:h-2
                             before:bg-transparent
                            ">
                                <div className="p-3">
                                    <div className="text-sm font-bold">{ user?.fullName || user?.email }</div>
                                    <div className="text-xs text-slate-500 mt-0.5">{ role }</div>
                                </div>

                                <div className="h-px bg-slate-100" />

                                <div className="p-2">
                                    <MenuItem label="Tài khoản" onClick={ () => go("/profile") } />
                                    <MenuItem label="Đơn hàng" onClick={ () => go("/orders") } />
                                    <MenuItem label="Yêu thích" onClick={ () => go("/wishlist") } />

                                    { role === "seller" && (
                                        <>
                                            <div className="h-px bg-slate-100 my-2" />
                                            <MenuItem label="Quản lý sản phẩm" onClick={ () => go("/seller/products") } />
                                            <MenuItem label="Đơn của shop" onClick={ () => go("/seller/orders") } />
                                        </>
                                    ) }

                                    <div className="h-px bg-slate-100 my-2" />
                                    <button
                                        onClick={ logout }
                                        className="w-full text-left rounded-xl px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                                    >
                                        Đăng xuất
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) }
                </div>
            </div>
        </header>
    );
}

function MenuItem({ label, onClick }) {
    return (
        <button
            onClick={ onClick }
            className="w-full text-left rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
            { label }
        </button>
    );
}
