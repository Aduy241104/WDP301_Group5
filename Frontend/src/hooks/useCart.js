import { useCallback, useEffect, useState } from "react";
import cartService from "../services/cartService";

export function useCart() {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedIds, setSelectedIds] = useState(() => new Set());

    const [modal, setModal] = useState({
        open: false,
        variant: "warning",
        title: "",
        message: "",
        confirmText: "Đã hiểu",
    });

    const closeModal = useCallback(() => {
        setModal((m) => ({ ...m, open: false }));
    }, []);

    const openStockChangedModal = useCallback(() => {
        setModal({
            open: true,
            variant: "warning",
            title: "Số lượng tồn kho đã thay đổi",
            message:"Số lượng bạn chọn không còn phù hợp với tồn kho hiện tại. Nhấn “Đã hiểu” để tải lại giỏ hàng.",
            confirmText: "Đã hiểu",
        });
    }, []);

    const fetchCart = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const res = await cartService.getCartAPI();
            setGroups(res?.groups ?? []);
        } catch (e) {
            setError(e?.response?.data?.message || e?.message || "Load cart failed");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const toggleSelect = useCallback((variantId) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(variantId)) next.delete(variantId);
            else next.add(variantId);
            return next;
        });
    }, []);

    const isSelected = useCallback(
        (variantId) => selectedIds.has(variantId),
        [selectedIds]
    );

    const clearSelected = useCallback(() => {
        setSelectedIds(new Set());
    }, []);

    const updateQty = useCallback(
        async (variantId, nextQty) => {
            // optimistic UI
            setGroups((prev) =>
                prev.map((g) => ({
                    ...g,
                    items: (g.items || []).map((it) =>
                        String(it.variantId) === String(variantId)
                            ? { ...it, quantity: nextQty }
                            : it
                    ),
                }))
            );

            try {
                await cartService.updateItemInCartAPI(variantId, nextQty);
            } catch (e) {
                const status = e?.response?.status;
                const msg = e?.response?.data?.message;

                if (status === 400) {
                    openStockChangedModal(msg);
                    return;
                }
                throw e;
            }
        },
        [openStockChangedModal]
    );

    const handleModalConfirm = useCallback(async () => {
        closeModal();
        await fetchCart();
    }, [closeModal, fetchCart]);

    const removeItem = useCallback(
        async (variantId) => {
            setGroups((prev) =>
                prev
                    .map((g) => ({
                        ...g,
                        items: (g.items || []).filter(
                            (it) => String(it.variantId) !== String(variantId)
                        ),
                    }))
                    .filter((g) => (g.items || []).length > 0)
            );

            // nếu item bị xóa → bỏ chọn luôn
            setSelectedIds((prev) => {
                const next = new Set(prev);
                next.delete(variantId);
                return next;
            });

            try {
                await cartService.deleteItemInCartAPI({ variantId });
                await fetchCart();
            } catch (e) {
                throw e;
            }
        },
        [fetchCart]
    );

    return {
        groups,
        loading,
        error,
        refetch: fetchCart,
        updateQty,
        removeItem,
        selectedIds,
        toggleSelect,
        isSelected,
        clearSelected,
        modal,
        closeModal,
        handleModalConfirm,
    };
}
