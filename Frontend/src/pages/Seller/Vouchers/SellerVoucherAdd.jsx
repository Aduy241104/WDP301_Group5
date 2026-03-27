import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createSellerVoucherAPI } from "../../../services/sellerVoucher.service";

const initialForm = {
    code: "",
    discountType: "percent",
    discountPercentage: "",
    usageLimitTotal: "",
    expirationDate: "",
};

export default function SellerVoucherAdd() {
    const navigate = useNavigate();
    const [form, setForm] = useState(initialForm);
    const [modalMessage, setModalMessage] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!form.code || !form.discountPercentage || !form.expirationDate) {
            setModalMessage("Vui lòng nhập đầy đủ mã voucher, giá trị giảm và ngày hết hạn.");
            setShowModal(true);
            return;
        }
        try {
            setLoading(true);
            await createSellerVoucherAPI({
                code: form.code,
                discountType: form.discountType,
                discountPercentage: Number(form.discountPercentage || 0),
                usageLimitTotal: Number(form.usageLimitTotal || 0),
                expirationDate: form.expirationDate,
            });
            setModalMessage("Tạo voucher thành công.");
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
                    <h1 className="text-2xl font-bold text-slate-900">Thêm Shop Voucher</h1>
                    <p className="text-slate-500 mt-1">Tạo mới voucher cho shop</p>
                </div>
                <button type="button" onClick={() => navigate("/seller/vouchers")} className="px-4 py-2 bg-slate-200 rounded-xl">
                    Về danh sách
                </button>
            </div>

            <form onSubmit={onSubmit} className="bg-white border border-slate-200 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <input className="h-11 px-3 rounded-xl border border-slate-200" placeholder="Mã voucher" value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} />
                <select className="h-11 px-3 rounded-xl border border-slate-200" value={form.discountType} onChange={(e) => setForm((p) => ({ ...p, discountType: e.target.value }))}>
                    <option value="percent">Giảm theo %</option>
                    <option value="fixed">Giảm số tiền cố định</option>
                </select>
                <input className="h-11 px-3 rounded-xl border border-slate-200" type="number" min="1" placeholder="Giá trị giảm" value={form.discountPercentage} onChange={(e) => setForm((p) => ({ ...p, discountPercentage: e.target.value }))} />
                <input className="h-11 px-3 rounded-xl border border-slate-200" type="number" min="0" placeholder="Số lượt sử dụng tối đa (0 = không giới hạn)" value={form.usageLimitTotal} onChange={(e) => setForm((p) => ({ ...p, usageLimitTotal: e.target.value }))} />
                <input className="h-11 px-3 rounded-xl border border-slate-200 md:col-span-2" type="datetime-local" value={form.expirationDate} onChange={(e) => setForm((p) => ({ ...p, expirationDate: e.target.value }))} />
                <button disabled={loading} type="submit" className="h-11 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60 md:col-span-2">
                    {loading ? "Đang tạo..." : "Tạo voucher"}
                </button>
            </form>

            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
                        <p className="text-gray-800 mb-6">{modalMessage}</p>
                        <div className="flex justify-end gap-2">
                            <button type="button" className="px-4 py-2 bg-slate-200 rounded" onClick={() => { setShowModal(false); setModalMessage(""); }}>
                                Ở lại trang
                            </button>
                            <button type="button" className="px-4 py-2 bg-indigo-600 text-white rounded" onClick={() => navigate("/seller/vouchers")}>
                                Về danh sách
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

