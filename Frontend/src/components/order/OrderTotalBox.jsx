const formatVND = (n) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n || 0);

export default function OrderTotalBox({
    total,
    subTotal = 0,
    shippingFee = 0,
    shipDiscount = 0,
    systemVoucher,
    onPickSystemVoucher,
    onRemoveSystemVoucher,
    onSubmit,
    submitting
}) {
    return (
        <div className="mt-8 rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                <div className="space-y-0.5">
                    <div className="text-sm font-semibold text-slate-800">
                        Voucher toàn đơn
                    </div>
                    <div className="text-xs text-slate-500">
                        { systemVoucher
                            ? `Đã áp dụng: ${systemVoucher}`
                            : "Chưa chọn voucher" }
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    { systemVoucher && (
                        <button
                            onClick={ onRemoveSystemVoucher }
                            type="button"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition"
                        >
                            ✕ Gỡ
                        </button>
                    ) }

                    { !systemVoucher && <button
                        onClick={ onPickSystemVoucher }
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
                    >
                        🎟 Voucher
                    </button> }
                </div>
            </div>

            <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                    <span className="text-slate-600">Tiền hàng</span>
                    <span className="font-medium text-slate-900">
                        { formatVND(subTotal) }
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-slate-600">Phí vận chuyển</span>
                    <span className="font-medium text-slate-900">
                        { formatVND(shippingFee) }
                    </span>
                </div>

                { shipDiscount > 0 && (
                    <div className="flex items-center justify-between">
                        <span className="text-slate-600">Giảm phí ship</span>
                        <span className="font-medium text-emerald-600">
                            -{ formatVND(shipDiscount) }
                        </span>
                    </div>
                ) }
            </div>

            <div className="border-t pt-4" />

            <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-slate-800">
                    Tổng thanh toán
                </span>
                <span className="text-xl font-bold text-emerald-600">
                    { formatVND(total) }
                </span>
            </div>
            <button
                disabled={ submitting }
                onClick={ onSubmit }
                className="w-full rounded-xl bg-sky-500 hover:bg-sky-600 active:scale-[0.99] transition text-white font-bold py-3 shadow-sm"
            >
                { submitting ? "Đang đặt hàng..." : "Đặt hàng" }
            </button>
        </div>
    );
}
