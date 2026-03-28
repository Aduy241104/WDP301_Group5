import { useEffect, useState } from "react";
import {
    createSellerVoucherAPI,
    deleteSellerVoucherAPI,
    getSellerVouchersAPI,
    updateSellerVoucherAPI,
} from "../../../services/sellerVoucher.service";

const initialForm = {
    code: "",
    discountPercentage: "",
    expirationDate: "",
    discountType: "percent",
    usageLimitTotal: "",
};

export default function SellerVouchers() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [confirmId, setConfirmId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingVoucher, setEditingVoucher] = useState(null);
    const [editForm, setEditForm] = useState({
        discountPercentage: "",
        expirationDate: "",
        discountType: "percent",
        usageLimitTotal: "",
    });
    const [form, setForm] = useState(initialForm);

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

    const onCreate = async (e) => {
        e.preventDefault();
        if (!form.code || !form.discountPercentage || !form.expirationDate) {
            setModalMessage("Vui lòng nhập đầy đủ mã voucher, giá trị giảm và ngày hết hạn.");
            setShowModal(true);
            return;
        }
        try {
            await createSellerVoucherAPI({
                code: form.code,
                discountPercentage: Number(form.discountPercentage || 0),
                discountType: form.discountType,
                usageLimitTotal: Number(form.usageLimitTotal || 0),
                expirationDate: form.expirationDate,
            });
            setForm(initialForm);
            setShowForm(false);
            await loadData();
        } catch (e) {
            setModalMessage(e?.response?.data?.message || "Không thể tạo voucher.");
            setShowModal(true);
        }
    };

    const onToggle = async (voucher) => {
        try {
            await updateSellerVoucherAPI(voucher._id, { isActive: !voucher.isActive });
            await loadData();
        } catch (e) {
            setModalMessage(e?.response?.data?.message || "Không thể cập nhật trạng thái voucher.");
            setShowModal(true);
        }
    };

    const onDelete = async (voucherId) => {
        setConfirmId(voucherId);
        setShowModal(true);
    };

    const onStartEdit = (voucher) => {
        setEditingVoucher(voucher);
        setEditForm({
            discountType: voucher.discountType || "percent",
            discountPercentage: String(voucher.discountValue || ""),
            expirationDate: voucher.endAt ? new Date(voucher.endAt).toISOString().slice(0, 16) : "",
            usageLimitTotal: String(voucher.usageLimitTotal ?? ""),
        });
        setShowForm(true);
    };

    const onSaveEdit = async (e) => {
        e.preventDefault();
        if (!editingVoucher) return;
        try {
            await updateSellerVoucherAPI(editingVoucher._id, {
                discountType: editForm.discountType,
                discountPercentage: Number(editForm.discountPercentage || 0),
                expirationDate: editForm.expirationDate,
                usageLimitTotal: Number(editForm.usageLimitTotal || 0),
            });
            setEditingVoucher(null);
            setShowForm(false);
            await loadData();
        } catch (e) {
            setModalMessage(e?.response?.data?.message || "Không thể cập nhật voucher.");
            setShowModal(true);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Shop Voucher Management</h1>
                <p className="text-slate-500 mt-1">Tạo, xem danh sách, bật/tắt và xóa voucher của shop</p>
            </div>

            <div className="flex justify-end">
                {!showForm ? (
                    <button
                        onClick={() => {
                            setEditingVoucher(null);
                            setForm(initialForm);
                            setShowForm(true);
                        }}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-semibold text-sm"
                        type="button"
                    >
                        + Thêm voucher
                    </button>
                ) : (
                    <button
                        onClick={() => {
                            setEditingVoucher(null);
                            setShowForm(false);
                        }}
                        className="px-4 py-2 bg-slate-200 text-slate-800 rounded-xl hover:bg-slate-300 transition font-semibold text-sm"
                        type="button"
                    >
                        Đóng form
                    </button>
                )}
            </div>

            {showForm && !editingVoucher && (
                <form onSubmit={onCreate} className="bg-white border border-slate-200 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-6 gap-3">
                    <input className="h-11 px-3 rounded-xl border border-slate-200" placeholder="Voucher code" value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} />
                    <select
                        className="h-11 px-3 rounded-xl border border-slate-200"
                        value={form.discountType}
                        onChange={(e) => setForm((p) => ({ ...p, discountType: e.target.value }))}
                    >
                        <option value="percent">Giảm theo %</option>
                        <option value="fixed">Giảm số tiền cố định</option>
                    </select>
                    <input className="h-11 px-3 rounded-xl border border-slate-200" type="number" min="1" placeholder="Giá trị giảm" value={form.discountPercentage} onChange={(e) => setForm((p) => ({ ...p, discountPercentage: e.target.value }))} />
                    <input className="h-11 px-3 rounded-xl border border-slate-200" type="number" min="0" placeholder="Số lượt tối đa (0 = không giới hạn)" value={form.usageLimitTotal} onChange={(e) => setForm((p) => ({ ...p, usageLimitTotal: e.target.value }))} />
                    <input className="h-11 px-3 rounded-xl border border-slate-200" type="datetime-local" value={form.expirationDate} onChange={(e) => setForm((p) => ({ ...p, expirationDate: e.target.value }))} />
                    <button type="submit" className="h-11 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700">Tạo voucher</button>
                </form>
            )}

            {showForm && editingVoucher && (
                <form onSubmit={onSaveEdit} className="bg-white border border-slate-200 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-6 gap-3">
                    <div className="h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center text-slate-700 font-semibold">
                        {editingVoucher.code}
                    </div>
                    <select
                        className="h-11 px-3 rounded-xl border border-slate-200"
                        value={editForm.discountType}
                        onChange={(e) => setEditForm((p) => ({ ...p, discountType: e.target.value }))}
                    >
                        <option value="percent">Giảm theo %</option>
                        <option value="fixed">Giảm số tiền cố định</option>
                    </select>
                    <input
                        className="h-11 px-3 rounded-xl border border-slate-200"
                        type="number"
                        min="1"
                        placeholder="Giá trị giảm"
                        value={editForm.discountPercentage}
                        onChange={(e) => setEditForm((p) => ({ ...p, discountPercentage: e.target.value }))}
                    />
                    <input
                        className="h-11 px-3 rounded-xl border border-slate-200"
                        type="number"
                        min="0"
                        placeholder="Số lượt tối đa (0 = không giới hạn)"
                        value={editForm.usageLimitTotal}
                        onChange={(e) => setEditForm((p) => ({ ...p, usageLimitTotal: e.target.value }))}
                    />
                    <input
                        className="h-11 px-3 rounded-xl border border-slate-200"
                        type="datetime-local"
                        value={editForm.expirationDate}
                        onChange={(e) => setEditForm((p) => ({ ...p, expirationDate: e.target.value }))}
                    />
                    <div className="md:col-span-6 flex justify-end gap-2">
                        <button type="button" className="px-4 py-2 bg-slate-200 rounded-lg" onClick={() => setEditingVoucher(null)}>
                            Hủy
                        </button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                            Lưu chỉnh sửa
                        </button>
                    </div>
                </form>
            )}

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
                                                <button className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700" onClick={() => onToggle(v)}>
                                                    {v.isActive ? "Disable" : "Enable"}
                                                </button>
                                                <button className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700" onClick={() => onStartEdit(v)}>
                                                    Edit
                                                </button>
                                                <button className="px-3 py-1.5 rounded-lg bg-rose-100 text-rose-700" onClick={() => onDelete(v._id)}>
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
