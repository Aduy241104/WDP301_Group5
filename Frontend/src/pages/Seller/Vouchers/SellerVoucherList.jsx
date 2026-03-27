import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    deleteSellerVoucherAPI,
    getSellerVouchersAPI,
    updateSellerVoucherAPI,
} from "../../../services/sellerVoucher.service";

export default function SellerVoucherList() {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [confirmId, setConfirmId] = useState(null);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await getSellerVouchersAPI();
            setItems(res?.data || []);
        } catch (e) {
            setModalMessage(e?.response?.data?.message || "Không thể tải voucher shop.");
            setShowModal(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const onToggle = async (voucher) => {
        try {
            await updateSellerVoucherAPI(voucher._id, { isActive: !voucher.isActive });
            await loadData();
        } catch (e) {
            setModalMessage(e?.response?.data?.message || "Không thể cập nhật trạng thái voucher.");
            setShowModal(true);
        }
    };

    const onDelete = (voucherId) => {
        setConfirmId(voucherId);
        setShowModal(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Shop Voucher Management</h1>
                    <p className="text-slate-500 mt-1">Tạo, chỉnh sửa, bật/tắt và xóa voucher của shop</p>
                </div>
                <button
                    type="button"
                    onClick={() => navigate("/seller/vouchers/new")}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-semibold text-sm"
                >
                    + Thêm voucher
                </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-50 text-slate-600">
                            <tr className="border-b border-slate-200">
                                <th className="px-4 py-3 text-left font-semibold">Code</th>
                                <th className="px-4 py-3 text-left font-semibold">Discount</th>
                                <th className="px-4 py-3 text-left font-semibold">Lượt dùng (đã dùng/tổng)</th>
                                <th className="px-4 py-3 text-left font-semibold">Expire at</th>
                                <th className="px-4 py-3 text-left font-semibold">Status</th>
                                <th className="px-4 py-3 text-right font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Đang tải...</td></tr>
                            ) : items.length === 0 ? (
                                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Chưa có voucher</td></tr>
                            ) : (
                                items.map((v) => (
                                    <tr key={v._id} className="border-b border-slate-100">
                                        <td className="px-4 py-3 font-semibold">{v.code}</td>
                                        <td className="px-4 py-3">
                                            {v.discountType === "fixed"
                                                ? `${Number(v.discountValue || 0).toLocaleString("vi-VN")}đ`
                                                : `${v.discountValue}%`}
                                        </td>
                                        <td className="px-4 py-3">
                                            {Number(v.usageLimitTotal || 0) === 0
                                                ? "không giới hạn"
                                                : `${Number(v.usedCount || 0)} / ${Number(v.usageLimitTotal || 0)}`}
                                        </td>
                                        <td className="px-4 py-3">{new Date(v.endAt).toLocaleString("vi-VN")}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${v.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>
                                                {v.isActive ? "Active" : "Disabled"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-2">
                                                <button className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700" onClick={() => onToggle(v)} type="button">
                                                    {v.isActive ? "Disable" : "Enable"}
                                                </button>
                                                <button className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700" onClick={() => navigate(`/seller/vouchers/${v._id}/edit`)} type="button">
                                                    Edit
                                                </button>
                                                <button className="px-3 py-1.5 rounded-lg bg-rose-100 text-rose-700" onClick={() => onDelete(v._id)} type="button">
                                                    Delete
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

            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
                        <p className="text-gray-800 mb-6">
                            {confirmId
                                ? "Bạn có chắc chắn muốn xóa voucher này? Hành động này không thể hoàn tác."
                                : modalMessage}
                        </p>
                        <div className="flex justify-end gap-2">
                            {confirmId && (
                                <button
                                    onClick={async () => {
                                        try {
                                            await deleteSellerVoucherAPI(confirmId);
                                            setConfirmId(null);
                                            setShowModal(false);
                                            setModalMessage("");
                                            await loadData();
                                        } catch (e) {
                                            setModalMessage(e?.response?.data?.message || "Không thể xóa voucher.");
                                            setConfirmId(null);
                                        }
                                    }}
                                    className="px-4 py-2 bg-rose-600 text-white rounded"
                                    type="button"
                                >
                                    Xóa
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setModalMessage("");
                                    setConfirmId(null);
                                }}
                                className="px-4 py-2 bg-gray-200 rounded"
                                type="button"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

