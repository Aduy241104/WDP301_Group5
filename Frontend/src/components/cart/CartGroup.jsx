import CartItemRow from "./CartItemRow";

export default function CartGroup({
    group,
    onUpdateQty,
    onRemoveItem,

    // NEW: select
    isSelected,
    toggleSelect,
}) {
    const shop = group.shop || {};
    const items = group.items || [];

    return (
        <section className="rounded-lg border border-slate-100 bg-white shadow-sm overflow-hidden">
            <div className="p-5 flex items-center gap-3 border-b border-slate-100">
                <img
                    src={ shop.avatar || "https://via.placeholder.com/40" }
                    alt={ shop.name || "shop" }
                    className="h-10 w-10 rounded-full object-cover border border-slate-200"
                />
                <div className="min-w-0">
                    <div className="font-semibold text-slate-900 truncate">
                        { shop.name || "Shop" }
                    </div>
                </div>
            </div>

            <div className="divide-y divide-slate-100">
                { items.map((it) => (
                    <CartItemRow
                        key={ it.variantId }
                        item={ it }
                        selected={ isSelected(it.variantId) }
                        onToggleSelect={ toggleSelect }
                        onUpdateQty={ onUpdateQty }
                        onRemove={ () => onRemoveItem(it.variantId) }
                    />
                )) }
            </div>
        </section>
    );
}
