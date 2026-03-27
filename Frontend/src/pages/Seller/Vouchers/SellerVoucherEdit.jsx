import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSellerVoucherDetailAPI, updateSellerVoucherAPI } from "../../../services/sellerVoucher.service";

export default function SellerVoucherEdit() {
    const { voucherId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        discountType: "percent",
        discountPercentage: "",
        usageLimitTotal: "",
        expirationDate: "",
        isActive: true,
    });
    const [modalMessage, setModalMessage] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [code, setCode] = useState("");

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const res = await getSellerVoucherDetailAPI(voucherId);
                const v = res?.data;
                setCode(v?.code || "");
                setForm({
                    discountType: v?.discountType || "percent",
                    discountPercentage: String(v?.discountValue ?? ""),
                    usageLimitTotal: String(v?.usageLimitTotal ?? ""),
                    expirationDate: v?.endAt ? new Date(v.endAt).toISOString().slice(0, 16) : "",
                    isActive: Boolean(v?.isActive),
                });
            } catch (e) {
                setModalMessage(e?.response?.data?.message || "Không thể tải chi tiết voucher.");
                setShowModal(true);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [voucherId]);

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await updateSellerVoucherAPI(voucherId, {
                discountType: form.discountType,
                discountPercentage: Number(form.discountPercentage || 0),
                usageLimitTotal: Number(form.usageLimitTotal || 0),
                expirationDate: form.expirationDate,
                isActive: form.isActive,
            });
            setModalMessage("Cập nhật voucher thành công.");
            setShowModal(true);
        } catch (e) {
            setModalMessage(e?.response?.data?.message || "Không thể cập nhật voucher.");
            setShowModal(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Chỉnh sửa Shop Voucher</h1>
                    <p className="text-slate-500 mt-1">Mã voucher: <span className="font-semibold text-slate-900">{code || "—"}</span></p>
                </div>
                <button type="button" onClick={() => navigate("/seller/vouchers")} className="px-4 py-2 bg-slate-200 rounded-xl">
                    Về danh sách
                </button>
            </div>

            <form onSubmit={onSubmit} className="bg-white border border-slate-200 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <select className="h-11 px-3 rounded-xl border border-slate-200" value={form.discountType} onChange={(e) => setForm((p) => ({ ...p, discountType: e.target.value }))}>
                    <option value="percent">Giảm theo %</option>
                    <option value="fixed">Giảm số tiền cố định</option>
                </select>
                <input className="h-11 px-3 rounded-xl border border-slate-200" type="number" min="1" placeholder="Giá trị giảm" value={form.discountPercentage} onChange={(e) => setForm((p) => ({ ...p, discountPercentage: e.target.value }))} />
                <input className="h-11 px-3 rounded-xl border border-slate-200" type="number" min="0" placeholder="Số lượt sử dụng tối đa (0 = không giới hạn)" value={form.usageLimitTotal} onChange={(e) => setForm((p) => ({ ...p, usageLimitTotal: e.target.value }))} />
                <input className="h-11 px-3 rounded-xl border border-slate-200" type="datetime-local" value={form.expirationDate} onChange={(e) => setForm((p) => ({ ...p, expirationDate: e.target.value }))} />
                <label className="md:col-span-2 flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} />
                    Kích hoạt voucher
                </label>
                <button disabled={loading} type="submit" className="h-11 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60 md:col-span-2">
                    {loading ? "Đang lưu..." : "Lưu thay đổi"}
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

