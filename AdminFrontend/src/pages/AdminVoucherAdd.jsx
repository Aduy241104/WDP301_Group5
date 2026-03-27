import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createSystemVoucher } from "../services/adminVoucherServices";

const initialForm = {
    code: "",
    name: "",
    description: "",
    discountValue: "",
    maxDiscountValue: "",
    minOrderValue: "",
    usageLimitTotal: "",
    startAt: "",
    endAt: "",
};

export default function AdminVoucherAdd() {
    const navigate = useNavigate();
    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [showModal, setShowModal] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        // validate cơ bản phía client
        if (!form.code || !form.name || !form.startAt || !form.endAt) {
            setModalMessage("Vui lòng nhập đầy đủ mã voucher, tên voucher và thời gian áp dụng.");
            setShowModal(true);
            return;
        }
        try {
            setLoading(true);
            await createSystemVoucher({
                ...form,
                discountValue: Number(form.discountValue || 0),
                maxDiscountValue: Number(form.maxDiscountValue || 0),
                minOrderValue: Number(form.minOrderValue || 0),
                usageLimitTotal: Number(form.usageLimitTotal || 0),
            });
            setModalMessage("Tạo voucher thành công");
            setShowModal(true);
        } catch (e) {
            setModalMessage(e?.response?.data?.message || "Không thể tạo voucher.");
            setShowModal(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Thêm System Voucher</h1>
                    <p className="text-slate-500 mt-1">Tạo mới voucher hệ thống</p>
                </div>
            </div>

            <form onSubmit={onSubmit} className="bg-white border border-slate-200 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <input className="h-11 px-3 rounded-xl border border-slate-200" placeholder="Code" value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} />
                <input className="h-11 px-3 rounded-xl border border-slate-200" placeholder="Tên voucher" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                <input className="h-11 px-3 rounded-xl border border-slate-200 md:col-span-2" placeholder="Mô tả" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
                <input className="h-11 px-3 rounded-xl border border-slate-200" type="number" placeholder="Giảm phí ship (VND)" value={form.discountValue} onChange={(e) => setForm((p) => ({ ...p, discountValue: e.target.value }))} />
                <input className="h-11 px-3 rounded-xl border border-slate-200" type="number" placeholder="Giảm tối đa (VND)" value={form.maxDiscountValue} onChange={(e) => setForm((p) => ({ ...p, maxDiscountValue: e.target.value }))} />
                <input className="h-11 px-3 rounded-xl border border-slate-200" type="number" placeholder="Đơn tối thiểu (VND)" value={form.minOrderValue} onChange={(e) => setForm((p) => ({ ...p, minOrderValue: e.target.value }))} />
                <input className="h-11 px-3 rounded-xl border border-slate-200" type="number" min="0" placeholder="Số lượt sử dụng tối đa (0 = không giới hạn)" value={form.usageLimitTotal} onChange={(e) => setForm((p) => ({ ...p, usageLimitTotal: e.target.value }))} />
                <div className="grid grid-cols-2 gap-3">
                    <input className="h-11 px-3 rounded-xl border border-slate-200" type="datetime-local" value={form.startAt} onChange={(e) => setForm((p) => ({ ...p, startAt: e.target.value }))} />
                    <input className="h-11 px-3 rounded-xl border border-slate-200" type="datetime-local" value={form.endAt} onChange={(e) => setForm((p) => ({ ...p, endAt: e.target.value }))} />
                </div>
                <button disabled={loading} type="submit" className="h-11 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60">
                    {loading ? "Đang tạo..." : "Tạo voucher"}
                </button>
            </form>

            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
                        <p className="text-gray-800 mb-6">{modalMessage}</p>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                className="px-4 py-2 bg-slate-200 rounded"
                                onClick={() => {
                                    setShowModal(false);
                                    setModalMessage("");
                                }}
                            >
                                Ở lại trang
                            </button>
                            <button
                                type="button"
                                className="px-4 py-2 bg-blue-600 text-white rounded"
                                onClick={() => navigate("/admin/vouchers")}
                            >
                                Về danh sách
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
