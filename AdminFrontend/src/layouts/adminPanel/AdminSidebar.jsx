import React from "react";
import { NavLink, useLocation } from "react-router-dom";

const navLinkBase =
    "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition";

function NavItem({ to, icon, label, end }) {
    return (
        <NavLink
            to={to}
            end={end}
            className={({ isActive }) =>
                [
                    navLinkBase,
                    isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-slate-700 hover:bg-slate-100",
                ].join(" ")
            }
        >
            <span className="text-slate-500">{icon}</span>
            <span>{label}</span>
        </NavLink>
    );
}


function NavPlaceholder({ icon, label }) {
    return (
        <div
            className={[
                navLinkBase,
                "text-slate-400 cursor-not-allowed opacity-80",
            ].join(" ")}
            title="Chưa triển khai"
            aria-disabled="true"
        >
            <span className="text-slate-300">{icon}</span>
            <span>{label}</span>
        </div>
    );
}

export default function AdminSidebar() {
    return (
        <aside className="w-72 shrink-0 border-r border-slate-200 bg-white">
            <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100">
                <div className="font-extrabold text-slate-900 tracking-tight">
                    Admin Panel
                </div>
                <button
                    className="h-8 w-8 rounded-lg hover:bg-slate-100 text-slate-500 grid place-items-center"
                    title="Thu gọn (demo)"
                    type="button"
                >
                    <span className="text-xl leading-none">×</span>
                </button>
            </div>

            <nav className="p-4 space-y-1">
                <NavItem
                    to="/"
                    end
                    label="Dashboard"
                    icon={
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6V11h-6v9Zm0-16v5h6V4h-6Z"
                                fill="currentColor"
                            />
                        </svg>
                    }
                />

                <NavItem
                    to="/admin/seller-requests"
                    label="Duyệt yêu cầu Seller"
                    icon={
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M9 12l2 2 4-4"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3Z"
                                stroke="currentColor"
                                strokeWidth="2"
                            />
                            <path
                                d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3Z"
                                stroke="currentColor"
                                strokeWidth="2"
                            />
                            <path
                                d="M12 3c0 1-1 3-3 3S6 4 6 3s1-3 3-3 3 2 3 3Z"
                                stroke="currentColor"
                                strokeWidth="2"
                            />
                            <path
                                d="M12 21c0-1 1-3 3-3s3 2 3 3-1 3-3 3-3-2-3-3Z"
                                stroke="currentColor"
                                strokeWidth="2"
                            />
                        </svg>
                    }
                />
                <NavItem
                    to="/admin/sellers"
                    label="Danh sách Seller"
                    icon={
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <circle
                                cx="9"
                                cy="7"
                                r="4"
                                stroke="currentColor"
                                strokeWidth="2"
                            />
                            <path
                                d="M20 8v6M23 11h-6"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>
                    }
                />

                <NavItem
                    to="/admin/shops"
                    label="Danh sách Shop"
                    icon={
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M9 22V12h6v10"
                                stroke="currentColor"
                                strokeWidth="2"
                            />
                        </svg>
                    }
                />

                {/* <div className="pt-3 pb-1">
                    <div className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wide">
                        Khác (demo)
                    </div>
                </div> */}

                <div className="pt-3 pb-1">
                    <div className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wide">
                        Khác (demo)
                    </div>
                </div>

                <NavPlaceholder
                    label="Quản lý Người dùng"
                    icon={
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                                stroke="currentColor"
                                strokeWidth="2"
                            />
                            <circle
                                cx="12"
                                cy="7"
                                r="4"
                                stroke="currentColor"
                                strokeWidth="2"
                            />
                        </svg>
                    }
                />
                <NavPlaceholder
                    label="Quản lý Sản phẩm"
                    icon={
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"
                                stroke="currentColor"
                                strokeWidth="2"
                            />
                            <path
                                d="M12 22V12"
                                stroke="currentColor"
                                strokeWidth="2"
                            />
                        </svg>
                    }
                />
                <NavPlaceholder
                    label="Quản lý Danh mục"
                    icon={
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M4 6h16M4 12h16M4 18h16"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>
                    }
                />

                <NavItem
                    to="/admin/banners"

                    label="Quản lý Banner"
                    icon={
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <rect
                                x="3"
                                y="4"
                                width="18"
                                height="16"
                                rx="2"
                                stroke="currentColor"
                                strokeWidth="2"
                            />
                            <path
                                d="M7 14l2-2 3 3 4-4 2 2"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    }
                />
                <NavItem
                    to="/admin/reports"

                    label="Quản lý Khiếu nại"
                    icon={
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <circle
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="2"
                            />
                            <path
                                d="M12 8v5"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                            <path
                                d="M12 16h.01"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                            />
                        </svg>
                    }
                />
                <NavPlaceholder
                    label="Quản lý Voucher"
                    icon={
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M21 10a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2Z"
                                stroke="currentColor"
                                strokeWidth="2"
                            />
                            <path
                                d="M13 8l-2 8"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>
                    }
                />
            </nav>
        </aside>
    );
}

