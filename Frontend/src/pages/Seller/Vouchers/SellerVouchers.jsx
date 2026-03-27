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
};

export default function SellerVouchers() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState(initialForm);

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await getSellerVouchersAPI();
            setItems(res?.data || []);
        } catch (e) {
            setError(e?.response?.data?.message || "Không thể tải voucher shop.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const onCreate = async (e) => {
        e.preventDefault();
        try {
            await createSellerVoucherAPI({
                code: form.code,
                discountPercentage: Number(form.discountPercentage || 0),
                expirationDate: form.expirationDate,
            });
            setForm(initialForm);
            await loadData();
        } catch (e) {
            setError(e?.response?.data?.message || "Không thể tạo voucher.");
        }
    };

    const onToggle = async (voucher) => {
        try {
            await updateSellerVoucherAPI(voucher._id, { isActive: !voucher.isActive });
            await loadData();
        } catch (e) {
            setError(e?.response?.data?.message || "Không thể cập nhật trạng thái voucher.");
        }
    };

    const onDelete = async (voucherId) => {
        if (!window.confirm("Bạn có chắc muốn xóa voucher này?")) return;
        try {
            await deleteSellerVoucherAPI(voucherId);
            await loadData();
        } catch (e) {
            setError(e?.response?.data?.message || "Không thể xóa voucher.");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Shop Voucher Management</h1>
                <p className="text-slate-500 mt-1">Tạo, xem danh sách, bật/tắt và xóa voucher của shop</p>
            </div>

            <form onSubmit={onCreate} className="bg-white border border-slate-200 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-4 gap-3">
                <input className="h-11 px-3 rounded-xl border border-slate-200" placeholder="Voucher code" value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} />
                <input className="h-11 px-3 rounded-xl border border-slate-200" type="number" min="1" max="100" placeholder="Discount %" value={form.discountPercentage} onChange={(e) => setForm((p) => ({ ...p, discountPercentage: e.target.value }))} />
                <input className="h-11 px-3 rounded-xl border border-slate-200" type="datetime-local" value={form.expirationDate} onChange={(e) => setForm((p) => ({ ...p, expirationDate: e.target.value }))} />
                <button type="submit" className="h-11 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700">Create voucher</button>
            </form>

            {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-700 text-sm">{error}</div>}

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-50 text-slate-600">
                            <tr className="border-b border-slate-200">
                                <th className="px-4 py-3 text-left font-semibold">Code</th>
                                <th className="px-4 py-3 text-left font-semibold">Discount</th>
                                <th className="px-4 py-3 text-left font-semibold">Expire at</th>
                                <th className="px-4 py-3 text-left font-semibold">Status</th>
                                <th className="px-4 py-3 text-right font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Đang tải...</td></tr>
                            ) : items.length === 0 ? (
                                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Chưa có voucher</td></tr>
                            ) : (
                                items.map((v) => (
                                    <tr key={v._id} className="border-b border-slate-100">
                                        <td className="px-4 py-3 font-semibold">{v.code}</td>
                                        <td className="px-4 py-3">{v.discountValue}%</td>
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
        </div>
    );
}
