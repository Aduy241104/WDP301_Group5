import React from "react";
import { Link } from "react-router-dom";

export default function AdminFooter() {
    return (
        <footer className="mt-10 border-t border-slate-100 bg-white">
            <div className="mx-auto max-w-7xl px-4 py-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-2xl bg-[rgb(119,226,242)] shadow-sm" />
                        <span className="text-sm font-bold text-slate-800">
                            Uni<span className="text-[rgb(119,226,242)]">Trade</span> Admin
                        </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                        <Link to="/admin/seller-registrations" className="hover:text-slate-900 hover:underline">
                            Đăng ký Seller
                        </Link>
                        <Link to="/admin/shops" className="hover:text-slate-900 hover:underline">
                            Danh sách Shop
                        </Link>
                    </div>
                </div>
                <div className="mt-3 text-xs text-slate-500 text-center sm:text-left">
                    © {new Date().getFullYear()} UniTrade. Seller Management.
                </div>
            </div>
        </footer>
    );
}
