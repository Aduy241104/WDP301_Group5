
const formatVND = (n) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n || 0);

export default function OrderItemRow({ item }) {
    return (
        <div className="flex gap-4 p-4 border-b last:border-b-0 hover:bg-slate-50 transition">
            <img
                src={ item.product.images[0] }
                alt={ item.product.name }
                className="h-20 w-20 shrink-0 rounded-xl border border-slate-200 object-cover bg-white"
            />
            <div className="flex flex-1 flex-col justify-between min-w-0">
                <div className="space-y-0.5">
                    <div className="truncate font-semibold text-slate-900">
                        { item.product.name }
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5">
                            SKU: { item.variant.sku }
                        </span>

                        { item.variant.size && (
                            <span className="rounded-md bg-slate-100 px-2 py-0.5">
                                Size { item.variant.size }
                            </span>
                        ) }

                        <span className="rounded-md bg-slate-100 px-2 py-0.5">
                            SL: { item.qty }
                        </span>
                    </div>
                </div>

                <div className="text-sm font-semibold text-slate-900">
                    { formatVND(item.variant.price) }
                </div>
            </div>
        </div>
    );
}
