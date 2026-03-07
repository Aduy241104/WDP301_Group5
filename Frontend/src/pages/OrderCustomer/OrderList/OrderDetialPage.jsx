import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getOrderDetailAPI } from "../../../services/orderCustomerServices"; // <-- chỉnh path đúng project bạn

const STATUS_LABEL = {
    created: "Đã tạo",
    confirmed: "Đã xác nhận",
    shipped: "Đang giao",
    delivered: "Đã giao",
    cancelled: "Đã hủy",
};

function formatMoney(vnd) {
    const n = Number(vnd || 0);
    return n.toLocaleString("vi-VN") + "₫";
}

function formatDate(iso) {
    if (!iso) return "";
    try {
        return new Date(iso).toLocaleString("vi-VN");
    } catch {
        return iso;
    }
}

function getStatusBadgeClass(status) {
    switch (status) {
        case "created":
            return "bg-slate-100 text-slate-700 border-slate-200";
        case "confirmed":
            return "bg-blue-50 text-blue-700 border-blue-200";
        case "shipped":
            return "bg-amber-50 text-amber-700 border-amber-200";
        case "delivered":
            return "bg-emerald-50 text-emerald-700 border-emerald-200";
        case "cancelled":
            return "bg-rose-50 text-rose-700 border-rose-200";
        default:
            return "bg-slate-100 text-slate-700 border-slate-200";
    }
}

function canCancelOrder(status) {
    // rule phổ biến: chỉ hủy khi chưa giao
    return status === "created" || status === "confirmed";
}

export default function OrderDetailPage() {
    const { orderId } = useParams(); // <-- lấy từ URL
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [order, setOrder] = useState(null);

    // nếu bạn đã có API cancel thì gắn vào đây
    const [canceling, setCanceling] = useState(false);

    const cancelable = useMemo(() => canCancelOrder(order?.orderStatus), [order?.orderStatus]);

    async function load() {
        if (!orderId) return;
        try {
            setLoading(true);
            setErr("");

            const data = await getOrderDetailAPI(orderId);
            setOrder(data?.order || null);
        } catch (e) {
            setErr(e?.response?.data?.message || e?.message || "Failed to load order detail");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId]);

    async function onCancel() {
        // NOTE: bạn chưa đưa cancel API nên mình để TODO
        // Khi có, bạn làm: await cancelOrderAPI(orderId); rồi gọi load() lại
        const ok = window.confirm("Bạn chắc chắn muốn hủy đơn này?");
        if (!ok) return;

        try {
            setCanceling(true);
            // await cancelOrderAPI(orderId);
            // await load();

            alert("Bạn chưa gắn API hủy đơn. Hãy thay TODO bằng cancelOrderAPI(orderId).");
        } finally {
            setCanceling(false);
        }
    }

    if (loading) {
        return (
            <div className="mx-auto max-w-5xl p-4">
                <div className="animate-pulse space-y-3">
                    <div className="h-6 w-56 rounded bg-slate-200" />
                    <div className="h-24 rounded bg-slate-200" />
                    <div className="h-40 rounded bg-slate-200" />
                </div>
            </div>
        );
    }

    if (err) {
        return (
            <div className="mx-auto max-w-5xl p-4">
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
                    { err }
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="mx-auto max-w-5xl p-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-slate-700">
                    Không tìm thấy đơn hàng.
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl p-4 space-y-4">
            {/* Header */ }
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                        <div className="text-lg font-semibold text-slate-900">Chi tiết đơn hàng</div>
                        <div className="text-sm text-slate-600">
                            Mã đơn: <span className="font-medium text-slate-900">{ order.orderCode }</span>
                        </div>
                        <div className="text-sm text-slate-600">
                            Tạo lúc: <span className="text-slate-900">{ formatDate(order.createdAt) }</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span
                            className={ [
                                "inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium",
                                getStatusBadgeClass(order.orderStatus),
                            ].join(" ") }
                        >
                            { STATUS_LABEL[order.orderStatus] || order.orderStatus }
                        </span>

                        { cancelable && (
                            <button
                                onClick={ onCancel }
                                disabled={ canceling }
                                className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-100 disabled:opacity-60"
                            >
                                { canceling ? "Đang hủy..." : "Hủy đơn" }
                            </button>
                        ) }
                    </div>
                </div>

                {/* tracking + payment */ }
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <div className="text-sm text-slate-600">
                        Tracking:{ " " }
                        <span className="text-slate-900">{ order.trackingCode ? order.trackingCode : "Chưa có" }</span>
                    </div>
                    <div className="text-sm text-slate-600">
                        Thanh toán:{ " " }
                        <span className="text-slate-900">
                            { order.paymentMethod?.toUpperCase() } •{ " " }
                            { order.paymentStatus === "paid" ? "Đã thanh toán" : "Chưa thanh toán" }
                        </span>
                    </div>
                </div>
            </div>

            {/* Shop + Address */ }
            <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="text-sm font-semibold text-slate-900">Shop</div>
                    <div className="mt-3 flex items-center gap-3">
                        <img
                            src={ order.shop?.avatar }
                            alt={ order.shop?.name }
                            className="h-10 w-10 rounded-full border border-slate-200 object-cover"
                            onError={ (e) => {
                                e.currentTarget.src =
                                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='100%25' height='100%25' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' fill='%2364758b' font-size='14'%3EShop%3C/text%3E%3C/svg%3E";
                            } }
                        />
                        <div>
                            <div className="font-medium text-slate-900">{ order.shop?.name }</div>
                            <div className="text-sm text-slate-600">Shop ID: { order.shop?._id }</div>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="text-sm font-semibold text-slate-900">Địa chỉ nhận hàng</div>
                    <div className="mt-2 text-sm text-slate-700">
                        <div>
                            <span className="font-medium text-slate-900">{ order.deliveryAddress?.contact?.name }</span>{ " " }
                            • { order.deliveryAddress?.contact?.phone }
                        </div>
                        <div className="mt-1 text-slate-600">{ order.deliveryAddress?.address?.fullAddress }</div>
                    </div>
                </div>
            </div>

            {/* Items */ }
            <div className="rounded-2xl border border-slate-200 bg-white">
                <div className="border-b border-slate-200 p-4">
                    <div className="text-sm font-semibold text-slate-900">Sản phẩm</div>
                </div>

                <div className="divide-y divide-slate-200">
                    { (order.items || []).map((it, idx) => (
                        <div key={ it.variantId || idx } className="p-4 flex gap-3">
                            <img
                                src={ it.product?.image }
                                alt={ it.productName }
                                className="h-16 w-16 rounded-xl border border-slate-200 object-cover"
                            />
                            <div className="min-w-0 flex-1">
                                <div className="truncate font-medium text-slate-900">{ it.productName }</div>
                                <div className="mt-1 text-sm text-slate-600">
                                    Phân loại:{ " " }
                                    <span className="text-slate-900">{ it.variantLabel || it.variant?.size || "-" }</span>
                                </div>
                                <div className="mt-1 text-sm text-slate-600">
                                    SKU: <span className="text-slate-900">{ it.variant?.sku || "-" }</span>
                                </div>
                            </div>

                            <div className="text-right shrink-0">
                                <div className="text-sm text-slate-600">
                                    { formatMoney(it.price) } × { it.quantity }
                                </div>
                                <div className="mt-1 font-semibold text-slate-900">{ formatMoney(it.lineTotal) }</div>
                            </div>
                        </div>
                    )) }
                </div>
            </div>

            {/* Summary */ }
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between text-sm text-slate-700">
                    <span>Tạm tính</span>
                    <span className="text-slate-900">{ formatMoney(order.subtotal) }</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-slate-700">
                    <span>Phí ship</span>
                    <span className="text-slate-900">{ formatMoney(order.shippingFee) }</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-slate-700">
                    <span>Voucher</span>
                    <span className="text-slate-900">{ order.voucher ? "Có" : "Không có" }</span>
                </div>

                <div className="mt-3 border-t border-slate-200 pt-3 flex items-center justify-between">
                    <span className="font-semibold text-slate-900">Tổng cộng</span>
                    <span className="text-lg font-bold text-slate-900">{ formatMoney(order.totalAmount) }</span>
                </div>
            </div>

            {/* Status history */ }
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold text-slate-900">Lịch sử trạng thái</div>
                <div className="mt-3 space-y-2">
                    { (order.statusHistory || []).map((h, i) => (
                        <div key={ i } className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2">
                            <div className="text-sm text-slate-700">{ STATUS_LABEL[h.status] || h.status }</div>
                            <div className="text-xs text-slate-500">{ formatDate(h.changedAt) }</div>
                        </div>
                    )) }
                </div>
            </div>
        </div>
    );
}