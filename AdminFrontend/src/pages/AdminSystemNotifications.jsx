import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    broadcastSellersNotification,
    notifySelectedSellers,
    fetchSellerNotifyCandidates,
} from "../services/adminNotificationServices";

export default function AdminSystemNotifications() {
    const [mode, setMode] = useState(/** @type {"all" | "selected"} */ ("all"));
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingRequest, setPendingRequest] = useState(null);

    const [candidates, setCandidates] = useState([]);
    const [candidatesLoading, setCandidatesLoading] = useState(false);
    const [keyword, setKeyword] = useState("");
    const [debouncedKeyword, setDebouncedKeyword] = useState("");
    const [selectedIds, setSelectedIds] = useState(() => new Set());

    useEffect(() => {
        const t = setTimeout(() => setDebouncedKeyword(keyword.trim()), 350);
        return () => clearTimeout(t);
    }, [keyword]);

    const loadCandidates = useCallback(async () => {
        try {
            setCandidatesLoading(true);
            const res = await fetchSellerNotifyCandidates({
                keyword: debouncedKeyword || undefined,
                limit: 400,
            });
            setCandidates(res?.items ?? []);
        } catch {
            setCandidates([]);
        } finally {
            setCandidatesLoading(false);
        }
    }, [debouncedKeyword]);

    useEffect(() => {
        if (mode !== "selected") return;
        loadCandidates();
    }, [mode, loadCandidates]);

    const toggleOne = (id) => {
        const sid = String(id);
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(sid)) next.delete(sid);
            else next.add(sid);
            return next;
        });
    };

    const selectAllVisible = () => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            candidates.forEach((c) => next.add(String(c._id)));
            return next;
        });
    };

    const clearSelection = () => setSelectedIds(new Set());

    const selectedCount = selectedIds.size;
    const visibleIds = useMemo(() => candidates.map((c) => String(c._id)), [candidates]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const t = title.trim();
        const m = message.trim();
        if (!t || !m) {
            alert("Nhập đầy đủ tiêu đề và nội dung.");
            return;
        }

        if (mode === "all") {
            setPendingRequest({ kind: "all", title: t, message: m });
            setConfirmOpen(true);
            return;
        }

        const ids = [...selectedIds];
        if (ids.length === 0) {
            alert("Chọn ít nhất một seller trong danh sách bên dưới.");
            return;
        }
        setPendingRequest({
            kind: "selected",
            title: t,
            message: m,
            ids,
        });
        setConfirmOpen(true);
    };

    const runConfirmed = async () => {
        if (!pendingRequest) return;
        try {
            setSubmitting(true);
            setError("");
            setResult(null);

            if (pendingRequest.kind === "all") {
                const res = await broadcastSellersNotification({
                    title: pendingRequest.title,
                    message: pendingRequest.message,
                });
                setResult({ ...res, mode: "all" });
                setMessage("");
                setTitle("");
                return;
            }

            const res = await notifySelectedSellers({
                title: pendingRequest.title,
                message: pendingRequest.message,
                sellerUserIds: pendingRequest.ids,
            });
            setResult({ ...res, mode: "selected" });
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                    err?.message ||
                    "Gửi thất bại."
            );
        } finally {
            setSubmitting(false);
            setConfirmOpen(false);
            setPendingRequest(null);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/15 px-3 py-1 text-xs font-semibold text-slate-700 mb-2">
                    System notification
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Thông báo tới Seller</h1>
                
            </div>

            <div className="flex flex-wrap gap-4">
                
                <Link to="/admin/sellers" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
                    Danh sách Seller
                </Link>
            </div>

            {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700 text-sm">{error}</div>
            )}
            {result && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 text-sm space-y-1">
                    <div>
                        {result.message} — Đã tạo <strong>{result.inserted ?? 0}</strong> thông báo.
                        {result.mode === "all"}
                        {result.mode === "selected" && (
                            <span className="block text-xs mt-1 opacity-90">(Gửi theo lựa chọn)</span>
                        )}
                    </div>
                    {result.invalidIds?.length > 0 && (
                        <div className="text-amber-800 text-xs">ID không hợp lệ: {result.invalidIds.join(", ")}</div>
                    )}
                    {result.skippedNotSellerOrInactive?.length > 0 && (
                        <div className="text-amber-800 text-xs">
                            Bỏ qua: {result.skippedNotSellerOrInactive.join(", ")}
                        </div>
                    )}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6"
            >
                <fieldset className="space-y-3">
                    <legend className="text-sm font-bold text-slate-900 mb-2">Đối tượng nhận thông báo</legend>
                    <label className="flex items-center gap-3 cursor-pointer rounded-xl border border-slate-200 p-4 hover:bg-slate-50/80 has-[:checked]:border-violet-400 has-[:checked]:bg-violet-50/40">
                        <input
                            type="radio"
                            name="notifyMode"
                            checked={mode === "all"}
                            onChange={() => {
                                setMode("all");
                                setError("");
                                setResult(null);
                            }}
                            className="text-violet-600"
                        />
                        <div className="font-semibold text-slate-900">Tất cả seller đang hoạt động</div>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer rounded-xl border border-slate-200 p-4 hover:bg-slate-50/80 has-[:checked]:border-indigo-400 has-[:checked]:bg-indigo-50/40">
                        <input
                            type="radio"
                            name="notifyMode"
                            checked={mode === "selected"}
                            onChange={() => {
                                setMode("selected");
                                setError("");
                                setResult(null);
                            }}
                            className="text-indigo-600"
                        />
                        <div className="font-semibold text-slate-900">Chọn một hoặc nhiều seller</div>
                    </label>
                </fieldset>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Tiêu đề</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 outline-none"
                        placeholder="Ví dụ: Cập nhật chính sách nền tảng"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Nội dung</label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={6}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 outline-none resize-y"
                        placeholder="Nội dung thông báo gửi tới seller..."
                    />
                </div>

                {mode === "selected" && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <div className="text-sm font-bold text-slate-900">Danh sách seller</div>
                                <div className="text-xs text-slate-500">
                                    Đang chọn: <strong>{selectedCount}</strong> — hiển thị tối đa 400 kết quả / lần tìm
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={selectAllVisible}
                                    disabled={!visibleIds.length}
                                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Chọn hết trang hiện tại
                                </button>
                                <button
                                    type="button"
                                    onClick={clearSelection}
                                    disabled={selectedCount === 0}
                                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Bỏ chọn tất cả
                                </button>
                            </div>
                        </div>
                        <input
                            type="search"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="Tìm theo tên, email, số điện thoại..."
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        />
                        <div className="max-h-72 overflow-y-auto rounded-lg border border-slate-200 bg-white divide-y divide-slate-100">
                            {candidatesLoading ? (
                                <div className="p-6 text-center text-slate-500 text-sm">Đang tải danh sách...</div>
                            ) : candidates.length === 0 ? (
                                <div className="p-6 text-center text-slate-500 text-sm">
                                    Không có seller active nào khớp tìm kiếm.
                                </div>
                            ) : (
                                candidates.map((c) => {
                                    const id = String(c._id);
                                    const checked = selectedIds.has(id);
                                    return (
                                        <label
                                            key={id}
                                            className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => toggleOne(id)}
                                                className="rounded border-slate-300 text-indigo-600"
                                            />
                                            <div className="min-w-0 flex-1">
                                                <div className="font-medium text-slate-900 truncate">
                                                    {c.fullName || "—"}
                                                </div>
                                                <div className="text-xs text-slate-500 truncate">{c.email}</div>
                                                {c.phone ? (
                                                    <div className="text-xs text-slate-400">{c.phone}</div>
                                                ) : null}
                                            </div>
                                        </label>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-2xl px-5 py-2.5 bg-violet-600 text-white text-sm font-semibold hover:bg-violet-500 disabled:opacity-60"
                >
                    {submitting
                        ? "Đang gửi..."
                        : mode === "all"
                          ? "Gửi tất cả seller"
                          : `Gửi ${selectedCount} seller`}
                </button>
            </form>

            {confirmOpen && pendingRequest && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-xl p-6">
                        <div className="text-lg font-bold text-slate-900">
                            Xác nhận gửi thông báo
                        </div>
                        <div className="text-sm text-slate-600 mt-2">
                            {pendingRequest.kind === "all"
                                ? "Bạn có chắc chắn muốn gửi thông báo này đến toàn bộ seller không?"
                                : `Bạn có chắc chắn muốn gửi thông báo cho ${pendingRequest.ids.length} seller đã chọn không?`}
                        </div>

                        {error && (
                            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-700 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="mt-5 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setConfirmOpen(false);
                                    setPendingRequest(null);
                                }}
                                className="rounded-xl px-4 py-2 bg-white border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                                disabled={submitting}
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={runConfirmed}
                                disabled={submitting}
                                className="rounded-xl px-4 py-2 bg-violet-600 text-white text-sm font-semibold hover:bg-violet-500 disabled:opacity-60"
                            >
                                {submitting ? "Đang gửi..." : "Xác nhận"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
