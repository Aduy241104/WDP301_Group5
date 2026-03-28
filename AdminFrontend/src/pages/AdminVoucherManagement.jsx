import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    deleteSystemVoucher,
    fetchSystemVouchers,
    toggleSystemVoucher,
} from "../services/adminVoucherServices";

export default function AdminVoucherManagement() {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [confirmId, setConfirmId] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await fetchSystemVouchers();
            setItems(res?.data || []);
        } catch (e) {
            setError(e?.response?.data?.message || "Không thể tải danh sách voucher.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const onToggle = async (voucher) => {
        try {
            await toggleSystemVoucher(voucher._id, !voucher.isActive);
            await loadData();
        } catch (e) {
            setError(e?.response?.data?.message || "Không thể cập nhật trạng thái.");
        }
    };

    const onDelete = async (voucherId) => {
        setConfirmId(voucherId);
        setShowConfirm(true);
    };

    const onConfirmDelete = async () => {
        if (!confirmId) return;
        try {
            await deleteSystemVoucher(confirmId);
            setConfirmId(null);
            setShowConfirm(false);
            await loadData();
        } catch (e) {
            setError(e?.response?.data?.message || "Không thể xóa voucher.");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Quản lý System Voucher</h1>
                <p className="text-slate-500 mt-1">Xem danh sách, bật/tắt và xóa voucher hệ thống</p>
            </div>
            <div className="flex justify-end">
                <button
                    onClick={() => navigate("/admin/vouchers/new")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold text-sm"
                    type="button"
                >
                    + Thêm voucher
                </button>
            </div>

            {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-700 text-sm">{error}</div>}

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-50 text-slate-600">
                            <tr className="border-b border-slate-200">
                                <th className="px-4 py-3 text-left font-semibold">Code</th>
                                <th className="px-4 py-3 text-left font-semibold">Tên</th>
                                <th className="px-4 py-3 text-left font-semibold">Giảm ship</th>
                                <th className="px-4 py-3 text-left font-semibold">Lượt dùng (đã dùng/tổng)</th>
                                <th className="px-4 py-3 text-left font-semibold">Hết hạn</th>
                                <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
                                <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Đang tải...</td></tr>
                            ) : items.length === 0 ? (
                                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Không có voucher</td></tr>
                            ) : (
                                items.map((v) => (
                                    <tr key={v._id} className="border-b border-slate-100">
                                        <td className="px-4 py-3 font-semibold">{v.code}</td>
                                        <td className="px-4 py-3">{v.name}</td>
                                        <td className="px-4 py-3">{Number(v.discountValue || 0).toLocaleString("vi-VN")}đ</td>
                                        <td className="px-4 py-3">
                                            {Number(v.usageLimitTotal || 0) === 0
                                                ? "không giới hạn"
                                                : `${Number(v.usedCount || 0)} / ${Number(v.usageLimitTotal || 0)}`}
                                        </td>
                                        <td className="px-4 py-3">{new Date(v.endAt).toLocaleString("vi-VN")}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${v.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>
                                                {v.isActive ? "Đang bật" : "Đang tắt"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-2">
                                                <button className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700" onClick={() => onToggle(v)}>
                                                    {v.isActive ? "Tắt" : "Bật"}
                                                </button>
                                                <button
                                                    className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700"
                                                    onClick={() => navigate(`/admin/vouchers/${v._id}/edit`)}
                                                    type="button"
                                                >
                                                    Sửa
                                                </button>
                                                <button className="px-3 py-1.5 rounded-lg bg-rose-100 text-rose-700" onClick={() => onDelete(v._id)}>
                                                    Xóa
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {showConfirm && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
                        <p className="text-gray-800 mb-6">
                            Bạn có chắc chắn muốn xóa voucher này? Hành động này không thể hoàn tác.
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                className="px-4 py-2 bg-slate-200 rounded"
                                onClick={() => {
                                    setShowConfirm(false);
                                    setConfirmId(null);
                                }}
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                className="px-4 py-2 bg-rose-600 text-white rounded"
                                onClick={onConfirmDelete}
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
