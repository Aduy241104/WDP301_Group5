function mapOrderStatus(status) {
    switch (status) {
        case "created":
            return {
                text: "Chờ xác nhận",
                cls: "bg-amber-50 text-amber-700",
            };

        case "confirmed":
            return {
                text: "Đã xác nhận",
                cls: "bg-blue-50 text-blue-700",
            };

        case "shipped":
            return {
                text: "Đang vận chuyển",
                cls: "bg-indigo-50 text-indigo-700",
            };

        case "delivered":
            return {
                text: "Đã giao hàng",
                cls: "bg-emerald-50 text-emerald-700",
            };

        case "cancelled":
            return {
                text: "Đã hủy",
                cls: "bg-red-50 text-red-700",
            };

        default:
            return {
                text: status || "Không xác định",
                cls: "bg-slate-100 text-slate-700",
            };
    }
}

export default function OrderStatusBadge({ orderStatus }) {
    const s = mapOrderStatus(orderStatus);

    return (
        <span
            className={ `rounded-full px-3 py-1 text-xs font-semibold ${s.cls}` }
        >
            { s.text }
        </span>
    );
}
