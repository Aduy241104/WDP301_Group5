import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { fetchUserProfile, blockUser, unblockUser } from "../services/adminUserServices";

const ROLE_LABELS = { user: "Người dùng", seller: "Seller", admin: "Admin" };

function StatusPill({ status }) {
    const map = {
        active: { label: "Hoạt động", cls: "bg-emerald-50 text-emerald-700" },
        blocked: { label: "Bị khóa", cls: "bg-rose-50 text-rose-700" },
        unknown: { label: "—", cls: "bg-slate-100 text-slate-700" },
    };
    const it = map[status ?? ""] ?? map.unknown;
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${it.cls}`}>
            {it.label}
        </span>
    );
}

function InfoRow({ label, value }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-2 border-b border-slate-100 last:border-0">
            <span className="text-sm font-medium text-slate-500 w-40 shrink-0">{label}</span>
            <span className="text-sm text-slate-900">{value ?? "—"}</span>
        </div>
    );
}

export default function AdminUserProfile() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const loadProfile = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await fetchUserProfile(userId);
            setData(res);
        } catch (err) {
            const message =
                err?.response?.data?.message || err?.message || "Không thể tải thông tin người dùng.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const handleBlockToggle = async () => {
        if (!data?.user) return;
        const isBlocked = data.user.status === "blocked";
        const confirmText = isBlocked
            ? "Mở khóa tài khoản người dùng này?"
            : "Khóa tài khoản này? Người dùng sẽ không thể đăng nhập.";
        if (!window.confirm(confirmText)) return;

        try {
            setSubmitting(true);
            if (isBlocked) {
                await unblockUser(data.user._id ?? userId);
            } else {
                await blockUser(data.user._id ?? userId);
            }
            await loadProfile();
        } catch (err) {
            alert(err?.response?.data?.message || err?.message || "Thao tác thất bại.");
        } finally {
            setSubmitting(false);
        }
    };

    const user = data?.user;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-semibold text-slate-700 mb-2">
                        User Management · View User Profile · Block / Unblock User
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Hồ sơ người dùng</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Xem thông tin chi tiết người dùng. Block / Unblock tài khoản.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Quay lại
                    </button>
                    <Link
                        to="/admin/users"
                        className="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                        Danh sách người dùng
                    </Link>
                    {user && (
                        <button
                            onClick={handleBlockToggle}
                            disabled={submitting}
                            className={[
                                "inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold text-white transition disabled:opacity-60",
                                user.status === "blocked" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-rose-600 hover:bg-rose-500",
                            ].join(" ")}
                        >
                            {user.status === "blocked" ? "Mở khóa" : "Khóa tài khoản"}
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700 text-sm">
                    {error}
                </div>
            )}

            {loading && !user && (
                <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
                    Đang tải...
                </div>
            )}

            {user && !loading && (
                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex flex-wrap items-center gap-4">
                        {user.avatar ? (
                            <img
                                src={user.avatar}
                                alt="Avatar"
                                className="w-16 h-16 rounded-full object-cover border-2 border-slate-200"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xl font-bold">
                                {(user.fullName ?? user.email ?? "?").charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">{user.fullName ?? "—"}</h2>
                            <p className="text-sm text-slate-600">{user.email}</p>
                            <div className="mt-2 flex items-center gap-2">
                                <StatusPill status={user.status} />
                                <span className="text-sm text-slate-500">
                                    {ROLE_LABELS[user.role] ?? user.role ?? "—"}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
                            Thông tin chi tiết
                        </h3>
                        <div className="space-y-0">
                            <InfoRow label="Họ và tên" value={user.fullName} />
                            <InfoRow label="Email" value={user.email} />
                            <InfoRow label="Số điện thoại" value={user.phone} />
                            <InfoRow label="Vai trò" value={ROLE_LABELS[user.role] ?? user.role} />
                            <InfoRow label="Trạng thái" value={user.status === "blocked" ? "Bị khóa" : "Hoạt động"} />
                            <InfoRow
                                label="Ngày tạo"
                                value={user.createdAt ? new Date(user.createdAt).toLocaleString("vi-VN") : null}
                            />
                            {user.updatedAt && (
                                <InfoRow
                                    label="Cập nhật lần cuối"
                                    value={new Date(user.updatedAt).toLocaleString("vi-VN")}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
