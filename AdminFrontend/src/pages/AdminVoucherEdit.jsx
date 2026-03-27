import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchSystemVoucherDetail, updateSystemVoucher } from "../services/adminVoucherServices";

export default function AdminVoucherEdit() {
    const { voucherId } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        description: "",
        discountValue: "",
        maxDiscountValue: "",
        minOrderValue: "",
        startAt: "",
        endAt: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadDetail = async () => {
            try {
                setLoading(true);
                setError("");
                const res = await fetchSystemVoucherDetail(voucherId);
                const v = res?.data;
                setForm({
                    name: v?.name || "",
                    description: v?.description || "",
                    discountValue: v?.discountValue ?? "",
                    maxDiscountValue: v?.maxDiscountValue ?? "",
                    minOrderValue: v?.minOrderValue ?? "",
                    startAt: v?.startAt ? new Date(v.startAt).toISOString().slice(0, 16) : "",
                    endAt: v?.endAt ? new Date(v.endAt).toISOString().slice(0, 16) : "",
                });
            } catch (e) {
                setError(e?.response?.data?.message || "Không thể tải chi tiết voucher.");
            } finally {
                setLoading(false);
            }
        };

        loadDetail();
    }, [voucherId]);

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError("");
            await updateSystemVoucher(voucherId, {
                ...form,
                discountValue: Number(form.discountValue || 0),
                maxDiscountValue: Number(form.maxDiscountValue || 0),
                minOrderValue: Number(form.minOrderValue || 0),
            });
            navigate("/admin/vouchers");
        } catch (e) {
            setError(e?.response?.data?.message || "Không thể cập nhật voucher.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Chỉnh sửa System Voucher</h1>
                <p className="text-slate-500 mt-1">Cập nhật thông tin voucher hệ thống</p>
            </div>

            <form onSubmit={onSubmit} className="bg-white border border-slate-200 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <input className="h-11 px-3 rounded-xl border border-slate-200" placeholder="Tên voucher" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                <input className="h-11 px-3 rounded-xl border border-slate-200 md:col-span-2" placeholder="Mô tả" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
                <input className="h-11 px-3 rounded-xl border border-slate-200" type="number" placeholder="Giảm phí ship (VND)" value={form.discountValue} onChange={(e) => setForm((p) => ({ ...p, discountValue: e.target.value }))} />
                <input className="h-11 px-3 rounded-xl border border-slate-200" type="number" placeholder="Giảm tối đa (VND)" value={form.maxDiscountValue} onChange={(e) => setForm((p) => ({ ...p, maxDiscountValue: e.target.value }))} />
                <input className="h-11 px-3 rounded-xl border border-slate-200" type="number" placeholder="Đơn tối thiểu (VND)" value={form.minOrderValue} onChange={(e) => setForm((p) => ({ ...p, minOrderValue: e.target.value }))} />
                <div className="grid grid-cols-2 gap-3">
                    <input className="h-11 px-3 rounded-xl border border-slate-200" type="datetime-local" value={form.startAt} onChange={(e) => setForm((p) => ({ ...p, startAt: e.target.value }))} />
                    <input className="h-11 px-3 rounded-xl border border-slate-200" type="datetime-local" value={form.endAt} onChange={(e) => setForm((p) => ({ ...p, endAt: e.target.value }))} />
                </div>
                <button disabled={loading} type="submit" className="h-11 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60">
                    {loading ? "Đang cập nhật..." : "Lưu thay đổi"}
                </button>
            </form>

            {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-700 text-sm">{error}</div>}
        </div>
    );
}
