import { useMemo } from "react";
import { useCart } from "../hooks/useCart";
import CartHeader from "../components/cart/CartHeader";
import CartEmpty from "../components/cart/CartEmpty";
import CartGroup from "../components/cart/CartGroup";
import AppModal from "../components/common/AppModal";

const formatVND = (n) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n || 0);

export default function CartPage() {
    const {
        groups,
        loading,
        error,
        refetch,
        updateQty,
        removeItem,

        // select
        selectedIds,
        isSelected,
        toggleSelect,

        // modal
        modal,
        closeModal,
        handleModalConfirm,
    } = useCart();

    // ✅ TÍNH TỔNG TIỀN THEO ITEM ĐÃ TICK
    const selectedSubtotal = useMemo(() => {
        let sum = 0;

        for (const g of groups) {
            for (const it of g.items || []) {
                if (!selectedIds.has(it.variantId)) continue;

                sum +=
                    Number(it.quantity || 0) *
                    Number(it.variant?.price || 0);
            }
        }

        return sum;
    }, [groups, selectedIds]);

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-6xl px-4 py-8">
                <CartHeader onRefresh={ refetch } />

                { loading ? (
                    <div className="mt-6 space-y-4">
                        <div className="h-24 rounded-2xl bg-white border border-slate-100 animate-pulse" />
                        <div className="h-24 rounded-2xl bg-white border border-slate-100 animate-pulse" />
                        <div className="h-24 rounded-2xl bg-white border border-slate-100 animate-pulse" />
                    </div>
                ) : error ? (
                    <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
                        { error }
                    </div>
                ) : groups.length === 0 ? (
                    <CartEmpty />
                ) : (
                    <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* LEFT */ }
                        <div className="lg:col-span-2 space-y-5">
                            { groups.map((g) => (
                                <CartGroup
                                    key={ g.shop?._id }
                                    group={ g }
                                    onUpdateQty={ updateQty }
                                    onRemoveItem={ removeItem }

                                    // select
                                    isSelected={ isSelected }
                                    toggleSelect={ toggleSelect }
                                />
                            )) }
                        </div>

                        {/* RIGHT */ }
                        <aside className="lg:col-span-1">
                            <div className="sticky top-6 rounded-3xl border border-slate-100 bg-white shadow-sm p-5">
                                <h3 className="text-lg font-semibold text-slate-900">
                                    Tóm tắt
                                </h3>

                                <div className="mt-4 space-y-2 text-sm">
                                    <div className="flex items-center justify-between text-slate-600">
                                        <span>Tạm tính</span>
                                        <span className="font-medium text-slate-900">
                                            { formatVND(selectedSubtotal) }
                                        </span>
                                    </div>

                                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                        <span className="text-slate-700 font-semibold">
                                            Tổng
                                        </span>
                                        <span className="text-slate-900 font-bold">
                                            { formatVND(selectedSubtotal) }
                                        </span>
                                    </div>
                                </div>

                                <button
                                    disabled={ selectedIds.size === 0 }
                                    className={ [
                                        "mt-5 w-full rounded-2xl py-3 text-sm font-semibold transition",
                                        selectedIds.size === 0
                                            ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                                            : "bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.99]",
                                    ].join(" ") }
                                    onClick={ () => {
                                        const checkoutItems = groups
                                            .flatMap((g) => g.items)
                                            .filter((it) =>
                                                selectedIds.has(it.variantId)
                                            )
                                            .map((it) => ({
                                                variantId: it.variantId,
                                                quantity: it.quantity,
                                            }));

                                        console.log("CHECKOUT ITEMS:", checkoutItems);
                                        alert("Hook checkout sau nhé");
                                    } }
                                >
                                    Tiếp tục thanh toán
                                </button>

                                <p className="mt-3 text-xs text-slate-500">
                                    Số lượng có thể được tự điều chỉnh theo tồn kho
                                    khi load giỏ.
                                </p>
                            </div>
                        </aside>
                    </div>
                ) }
            </div>

            {/* MODAL */ }
            <AppModal
                open={ modal.open }
                variant={ modal.variant }
                title={ modal.title }
                message={ modal.message }
                confirmText={ modal.confirmText }
                onConfirm={ handleModalConfirm }
                onClose={ closeModal }
                closeOnBackdrop={ false }
            />
        </div>
    );
}
