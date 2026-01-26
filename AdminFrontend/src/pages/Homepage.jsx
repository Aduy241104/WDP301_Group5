import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Homepage() {
    const { user } = useAuth();
    const isAdmin = user?.role === "admin";

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-slate-500 mt-1">
                    Xin chào, {user?.fullName || user?.email || "bạn"}.
                </p>
            </div>

            {!isAdmin ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-slate-700">
                    Tài khoản này không có quyền Admin.
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                   
                </div>
            )}
        </div>
    );
}

function QuickCard({ to, title, desc, icon }) {
    return (
        <Link
            to={to}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow hover:border-blue-200 transition group"
        >
            <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 transition">
                    {icon}
                </div>
                <div>
                    <h2 className="font-bold text-slate-900">{title}</h2>
                    <p className="text-xs text-slate-500">Admin</p>
                </div>
            </div>
            <p className="text-sm text-slate-600">{desc}</p>
        </Link>
    );
}
