import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUserList, blockUser, unblockUser } from "../services/adminUserServices";

const ROLE_LABELS = {
    user: "Người dùng",
    seller: "Seller",
    admin: "Admin",
};

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

export default function AdminUserList() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [items, setItems] = useState([]);
    const [paging, setPaging] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [keyword, setKeyword] = useState("");
    const [searchInput, setSearchInput] = useState("");

    const loadData = async (page = 1) => {
        try {
            setLoading(true);
            setError("");
            const params = { page, limit: 20 };
            if (keyword.trim()) params.keyword = keyword.trim();
            const res = await fetchUserList(params);
            setItems(res?.items ?? []);
            setPaging(res?.paging ?? { page: 1, limit: 20, total: 0, totalPages: 0 });
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || "Không thể tải danh sách người dùng.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [keyword]);

    const handleSearch = (e) => {
        e?.preventDefault?.();
        setKeyword(searchInput.trim());
    };

    const doBlockToggle = async (userId, isBlocked) => {
        const ok = window.confirm(
            isBlocked ? "Mở khóa tài khoản này?" : "Khóa tài khoản này?"
        );
        if (!ok) return;
        try {
            setSubmitting(true);
            if (isBlocked) await unblockUser(userId);
            else await blockUser(userId);
            await loadData(paging.page);
        } catch (err) {
            alert(err?.response?.data?.message || err?.message || "Thao tác thất bại.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-semibold text-slate-700 mb-2">
                    User Management · View User List · Search User
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Danh sách người dùng</h1>
                <p className="text-slate-500 text-sm mt-1">
                    Xem danh sách người dùng, tìm kiếm theo từ khóa, xem hồ sơ chi tiết.
                </p>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3">
                <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Tìm theo tên, email, số điện thoại..."
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                    type="submit"
                    className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition"
                >
                    Tìm kiếm
                </button>
                {keyword && (
                    <button
                        type="button"
                        onClick={() => { setSearchInput(""); setKeyword(""); }}
                        className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                    >
                        Xóa bộ lọc
                    </button>
                )}
            </form>

            {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700 text-sm">
                    {error}
                </div>
            )}

            {/* Table */}
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-slate-500">Đang tải...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Họ tên</th>
                                    <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Email</th>
                                    <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Số điện thoại</th>
                                    <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Vai trò</th>
                                    <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Trạng thái</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                                            Chưa có người dùng nào.
                                        </td>
                                    </tr>
                                ) : (
                                    items.map((u) => {
                                        const userId = u._id;
                                        const isBlocked = u.status === "blocked";
                                        return (
                                            <tr key={u._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                                                <td className="px-4 py-3 text-sm font-medium text-slate-900">
                                                    {u.fullName ?? "—"}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-slate-600">{u.email ?? "—"}</td>
                                                <td className="px-4 py-3 text-sm text-slate-600">{u.phone ?? "—"}</td>
                                                <td className="px-4 py-3">
                                                    <span className="text-sm text-slate-700">
                                                        {ROLE_LABELS[u.role] ?? u.role ?? "—"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <StatusPill status={u.status} />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <IconButton
                                                            title="Xem chi tiết"
                                                            onClick={() => userId && navigate(`/admin/users/${userId}`)}
                                                            disabled={!userId}
                                                        >
                                                            <EyeIcon />
                                                        </IconButton>
                                                        <IconButton
                                                            title={isBlocked ? "Mở khóa" : "Khóa"}
                                                            onClick={() => userId && doBlockToggle(userId, isBlocked)}
                                                            disabled={submitting || !userId}
                                                            tone={isBlocked ? "success" : "danger"}
                                                        >
                                                            {isBlocked ? <UnlockIcon /> : <BlockIcon />}
                                                        </IconButton>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {paging.totalPages > 1 && (
                <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>
                        Trang {paging.page} / {paging.totalPages} · Tổng {paging.total} người dùng
                    </span>
                    <div className="flex gap-2">
                        <button
                            disabled={paging.page <= 1}
                            onClick={() => loadData(paging.page - 1)}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium disabled:opacity-50 hover:bg-slate-50"
                        >
                            Trước
                        </button>
                        <button
                            disabled={paging.page >= paging.totalPages}
                            onClick={() => loadData(paging.page + 1)}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium disabled:opacity-50 hover:bg-slate-50"
                        >
                            Sau
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function IconButton({ children, onClick, title, disabled, tone = "neutral" }) {
    const toneCls =
        tone === "success"
            ? "text-emerald-600 hover:bg-emerald-50"
            : tone === "danger"
                ? "text-rose-600 hover:bg-rose-50"
                : "text-slate-700 hover:bg-slate-100";
    return (
        <button
            type="button"
            title={title}
            onClick={onClick}
            disabled={disabled}
            className={[
                "h-9 w-9 rounded-full grid place-items-center transition",
                toneCls,
                disabled ? "opacity-40 cursor-not-allowed hover:bg-transparent" : "",
            ].join(" ")}
        >
            {children}
        </button>
    );
}

function EyeIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
                d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
                stroke="currentColor"
                strokeWidth="2"
            />
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
        </svg>
    );
}

function BlockIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            <path
                d="M7.5 7.5 16.5 16.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
}

function UnlockIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
                d="M7 11V8a5 5 0 0 1 10 0"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M6 11h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z"
                stroke="currentColor"
                strokeWidth="2"
            />
        </svg>
    );
}
