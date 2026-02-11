const REASON_TEXT = {
    OUT_OF_STOCK: "Không đủ tồn kho",
    VARIANT_NOT_FOUND: "Phân loại không tồn tại",
    PRODUCT_INACTIVE: "Sản phẩm đang tạm ẩn/không khả dụng",
    SHOP_BLOCKED: "Shop đang bị hạn chế",
    PRICE_CHANGED: "Giá đã thay đổi",
};

const reasonToText = (reason) => REASON_TEXT[reason] || reason || "Không xác định";

export default function OrderCreateErrorCard({
    errorResponse,
    onClose,
    onBackToCart,
}) {
    const message = errorResponse?.message || "Đặt hàng thất bại";
    const invalidItems = errorResponse?.error?.invalidItems || [];

    return (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-red-100 text-red-700">
                    {/* icon */ }
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 9v4" />
                        <path d="M12 17h.01" />
                        <path d="M10.3 3.6h3.4L21 20H3L10.3 3.6z" />
                    </svg>
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <div className="text-sm font-semibold text-red-800">
                                Không thể tạo đơn hàng
                            </div>
                            <div className="mt-0.5 text-xs text-red-700">
                                Mã lỗi: <span className="font-mono font-semibold">{ message }</span>
                            </div>
                        </div>

                        { onClose && (
                            <button
                                type="button"
                                onClick={ onClose }
                                className="rounded-lg px-2 py-1 text-red-700 hover:bg-red-100"
                                aria-label="close"
                            >
                                ✕
                            </button>
                        ) }
                    </div>

                    { invalidItems.length > 0 && (
                        <div className="mt-3">
                            <div className="text-xs font-medium text-red-800">
                                Sản phẩm không hợp lệ
                            </div>

                            <div className="mt-2 space-y-2">
                                { invalidItems.map((it, idx) => (
                                    <div
                                        key={ `${it.variantId}-${idx}` }
                                        className="rounded-xl border border-red-200 bg-white p-3"
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="min-w-0">
                                                <div className="text-sm font-semibold text-slate-900">
                                                    Variant
                                                </div>
                                                <div className="mt-0.5 break-all text-xs text-slate-500 font-mono">
                                                    { it.variantId }
                                                </div>
                                            </div>

                                            <span className="shrink-0 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                                                { reasonToText(it.reason) }
                                            </span>
                                        </div>

                                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                                            <div className="rounded-lg bg-slate-50 p-2">
                                                <div className="text-slate-500">Tồn kho</div>
                                                <div className="font-semibold text-slate-900">{ it.stock ?? "-" }</div>
                                            </div>
                                            <div className="rounded-lg bg-slate-50 p-2">
                                                <div className="text-slate-500">Bạn đặt</div>
                                                <div className="font-semibold text-slate-900">{ it.requestedQty ?? "-" }</div>
                                            </div>
                                        </div>

                                        { typeof it.stock === "number" && typeof it.requestedQty === "number" && (
                                            <div className="mt-2 text-[11px] text-red-700">
                                                Thiếu:{ " " }
                                                <span className="font-semibold">
                                                    { Math.max(0, it.requestedQty - it.stock) }
                                                </span>{ " " }
                                                sản phẩm
                                            </div>
                                        ) }
                                    </div>
                                )) }
                            </div>
                        </div>
                    ) }

                    <div className="mt-4 flex flex-wrap justify-end gap-2">
                        { onBackToCart && (
                            <button
                                type="button"
                                onClick={ onBackToCart }
                                className="rounded-xl border border-red-200 bg-white px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                            >
                                Quay lại giỏ hàng
                            </button>
                        ) }
                        { onClose && (
                            <button
                                type="button"
                                onClick={ onClose }
                                className="rounded-xl bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
                            >
                                Đóng
                            </button>
                        ) }
                    </div>
                </div>
            </div>
        </div>
    );
}
