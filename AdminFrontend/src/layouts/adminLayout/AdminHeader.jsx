import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
    { to: "/admin/seller-requests", label: "Duyệt yêu cầu" },
    { to: "/admin/sellers", label: "Danh sách Seller" },
    { to: "/admin/shops", label: "Danh sách Shop" },
];

export default function AdminHeader() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const isAdmin = user?.role === "admin";

    const isActive = (path) => {
        if (path === "/admin/sellers")
            return location.pathname.startsWith("/admin/sellers");
        return location.pathname.startsWith(path);
    };

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-100">
            {/* top strip - Admin */}
            <div className="bg-[rgb(119,226,242)]/25">
                <div className="mx-auto max-w-7xl px-4 py-2 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex h-2 w-2 rounded-full bg-[rgb(119,226,242)]" />
                        <span className="text-slate-700 font-semibold">Admin • Seller Management</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-4 text-slate-700">
                        <span className="text-xs">{user?.email}</span>
                    </div>
                </div>
            </div>

            {/* main header */}
            <div className="mx-auto max-w-7xl px-4 py-4 flex items-center gap-6">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 select-none shrink-0">
                    <div className="h-10 w-10 rounded-2xl bg-[rgb(119,226,242)] shadow-sm" />
                    <div className="leading-tight text-left">
                        <div className="text-lg font-extrabold tracking-tight">
                            Uni<span className="text-[rgb(119,226,242)]">Trade</span>
                        </div>
                        <div className="text-xs text-slate-500 -mt-0.5">Admin</div>
                    </div>
                </Link>

                {/* Nav - Seller Management */}
                <nav className="flex items-center gap-1">
                    <Link
                        to="/"
                        className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                            location.pathname === "/"
                                ? "bg-[rgb(119,226,242)]/20 text-slate-900"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                    >
                        Trang chủ
                    </Link>
                    {isAdmin && NAV_ITEMS.map((it) => (
                        <Link
                            key={it.to}
                            to={it.to}
                            className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                                isActive(it.to)
                                    ? "bg-[rgb(119,226,242)]/20 text-slate-900"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                        >
                            {it.label}
                        </Link>
                    ))}
                </nav>

                {/* Right - user */}
                <div className="ml-auto flex items-center gap-2">
                    <div className="relative group">
                        <button className="rounded-2xl px-3 py-2 border border-slate-200 bg-white shadow-sm hover:shadow transition">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-xl bg-[rgb(119,226,242)]/40 border border-slate-200 overflow-hidden flex items-center justify-center">
                                    <span className="text-sm font-extrabold text-slate-800">
                                        {(user?.fullName?.[0] || user?.email?.[0] || "A").toUpperCase()}
                                    </span>
                                </div>
                                <div className="hidden md:block text-left">
                                    <div className="text-sm font-bold leading-tight">{user?.fullName || user?.email}</div>
                                    <div className="text-xs text-slate-500 -mt-0.5">Quản trị viên</div>
                                </div>
                                <svg width="16" height="16" viewBox="0 0 24 24" className="text-slate-600 hidden sm:block">
                                    <path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" />
                                </svg>
                            </div>
                        </button>

                        <div className="absolute right-0 mt-1 w-48 rounded-2xl border border-slate-200 bg-white shadow-lg opacity-0 pointer-events-none translate-y-1 group-hover:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0 transition before:content-[''] before:absolute before:-top-2 before:left-0 before:w-full before:h-2 before:bg-transparent">
                            <div className="p-3">
                                <div className="text-sm font-bold">{user?.fullName || user?.email}</div>
                                <div className="text-xs text-slate-500 mt-0.5">admin</div>
                            </div>
                            <div className="h-px bg-slate-100" />
                            <div className="p-2">
                                <Link
                                    to="/profile"
                                    className="block w-full text-left rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                    Tài khoản
                                </Link>
                                <button
                                    onClick={logout}
                                    className="w-full text-left rounded-xl px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                                >
                                    Đăng xuất
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
