import React from "react";
import { useAuth } from "../../context/AuthContext";

export default function AdminTopbar() {
    const { user, logout } = useAuth();

    const initial = (user?.fullName?.[0] || user?.email?.[0] || "A").toUpperCase();

    return (
        <div className="h-16 bg-white border-b border-slate-200 flex items-center">
            <div className="mx-auto w-full max-w-6xl px-6 flex items-center justify-between">
                <div className="text-sm text-slate-500">
                    {/* để trống giống ảnh (có thể thêm breadcrumb sau) */}
                </div>

                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-blue-600 text-white font-bold grid place-items-center">
                        {initial}
                    </div>
                    <div className="text-sm font-semibold text-slate-800">
                        {user?.role === "admin" ? "Admin" : (user?.fullName || user?.email || "User")}
                    </div>
                    <button
                        onClick={logout}
                        className="ml-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
                        type="button"
                    >
                        Đăng xuất
                    </button>
                </div>
            </div>
        </div>
    );
}

