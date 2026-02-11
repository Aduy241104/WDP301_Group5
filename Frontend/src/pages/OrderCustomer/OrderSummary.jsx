import { useEffect, useMemo, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { createOrder, placeOrderAPI } from "../../services/orderCustomerServices";
import ShopOrderCard from "../../components/order/ShopOrderCard";
import InvalidItemsBox from "../../components/order/InvalidItemsBox";
import OrderTotalBox from "../../components/order/OrderTotalBox";
import SystemVoucherModal from "../../components/order/SystemVoucherModal";
import VoucherModal from "../../components/order/VoucherModal";
import { buildCreateOrderPayload } from "../../utils/builCreateOrderPayload";
import OrderCreateErrorCard from "./OrderCreateErrorCard";
import DeliveryAddressPicker from "../../components/order/DeliveryAddressPicker.JSX";

function OrderSummary() {
    const { state } = useLocation();
    const navigate = useNavigate();

    const [dataOrder, setDataOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [orderError, setOrderError] = useState(null);

    // system voucher
    const [systemVoucher, setSystemVoucher] = useState(null);
    const [shipDiscount, setShipDiscount] = useState(0);
    const [systemModalOpen, setSystemModalOpen] = useState(false);

    // shop vouchers
    const [shopVouchers, setShopVouchers] = useState({});
    const [baseShopSubTotals, setBaseShopSubTotals] = useState({}); // lưu giá gốc theo shopId

    const [voucherModal, setVoucherModal] = useState({ open: false, shopId: null });
    const [submitting, setSubmitting] = useState(false);


    const [deliveryAddress, setDeliveryAddress] = useState(null);

    const variantIds = useMemo(() => {
        const raw = state?.selectedIds;
        if (!raw) return [];
        if (Array.isArray(raw)) return raw;
        try {
            return [...raw];
        } catch {
            return [];
        }
    }, [state]);

    const openVoucher = (shopId) => setVoucherModal({ open: true, shopId });
    const closeVoucher = () => setVoucherModal({ open: false, shopId: null });

    const recomputeGrandTotal = (groups, shippingFee, shipDiscountValue) => {
        const newGrandSubTotal = (groups || []).reduce((s, g) => s + (g.subTotal || 0), 0);
        return newGrandSubTotal + (shippingFee || 0) - (shipDiscountValue || 0);
    };

    useEffect(() => {
        const handleCreateOrder = async () => {
            try {
                setLoading(true);
                setError("");
                setOrderError(null);

                const res = await createOrder({ variantIds });
                setDataOrder(res);

                const initVouchers = {};
                const initBase = {};
                res.groups.forEach((g) => {
                    initVouchers[g.shopId] = null;
                    initBase[g.shopId] = g.subTotal;
                });

                setShopVouchers(initVouchers);
                setBaseShopSubTotals(initBase)

                setSystemVoucher(null);
                setShipDiscount(0);
            } catch (err) {
                setError(err.message || "Có lỗi xảy ra");
            } finally {
                setLoading(false);
            }
        };
        handleCreateOrder();
    }, [variantIds]);

    const grandSubTotal = useMemo(
        () => (dataOrder?.groups || []).reduce((s, g) => s + (g.subTotal || 0), 0),
        [dataOrder]
    );

    const shippingFeeTotal = dataOrder?.shippingFee ?? 0;

    const handleAppliedSystemVoucher = ({ voucherCode, shipDiscount: sd, grandTotal }) => {
        setSystemVoucher(voucherCode);
        setShipDiscount(sd || 0);

        setDataOrder((prev) => {
            if (!prev) return prev;
            return { ...prev, grandTotal };
        });
    };

    const currentGroup = useMemo(() => {
        if (!dataOrder || !voucherModal.shopId) return null;
        return dataOrder.groups.find((g) => g.shopId === voucherModal.shopId) || null;
    }, [dataOrder, voucherModal.shopId]);

    const handleAppliedVoucher = ({ shopId, voucherCode, newSubTotal }) => {
        setShopVouchers((prev) => ({ ...prev, [shopId]: voucherCode }));
        setDataOrder((prev) => {
            if (!prev) return prev;

            const groups = prev.groups.map((g) =>
                g.shopId === shopId ? { ...g, subTotal: newSubTotal } : g
            );

            const newGrandTotal = recomputeGrandTotal(groups, prev.shippingFee ?? 0, shipDiscount);

            return { ...prev, groups, grandTotal: newGrandTotal };
        });
    };

    const removeShopVoucher = (shopId) => {
        setShopVouchers((prev) => ({ ...prev, [shopId]: null }));

        setDataOrder((prev) => {
            if (!prev) return prev;

            const baseSub = baseShopSubTotals[shopId];
            if (typeof baseSub !== "number") return prev;

            const groups = prev.groups.map((g) =>
                g.shopId === shopId ? { ...g, subTotal: baseSub } : g
            );
            const newGrandTotal = recomputeGrandTotal(groups, prev.shippingFee ?? 0, shipDiscount);
            return { ...prev, groups, grandTotal: newGrandTotal };
        });
    };

    const removeSystemVoucher = () => {
        setSystemVoucher(null);
        setShipDiscount(0);
        console.log("hahah")
        setDataOrder((prev) => {
            if (!prev) return prev;

            const groups = prev.groups || [];
            const newGrandTotal = recomputeGrandTotal(groups, prev.shippingFee ?? 0, 0);

            return { ...prev, grandTotal: newGrandTotal };
        });
    };

    const handleSubmitOrder = async () => {
        try {
            setSubmitting(true);
            setError("");
            setOrderError(null);

            const payload = buildCreateOrderPayload({
                variantIds,
                deliveryAddress,
                systemVoucher,
                shopVouchers,
                paymentMethod: "cod",
            });

            if (!payload.variantIds.length) {
                throw new Error("Không có sản phẩm để đặt hàng");
            }

            if (!deliveryAddress) {
                throw new Error("Chưa chọn địa chỉ đặt hàng");
            }
            const res = await placeOrderAPI(payload);
            navigate("/order-success", { replace: true });
        } catch (err) {
            const apiData = err?.response?.data;

            if (apiData?.error?.invalidItems?.length) {
                setOrderError(apiData);
                setError("");
            } else {
                setError(apiData?.message || err.message || "Có lỗi xảy ra");
            }

        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Đang tạo đơn hàng…</div>;
    if (error) return <div className="p-8 text-center text-red-600">{ error }</div>;
    if (orderError) {
        return (
            <div className="p-4">
                <OrderCreateErrorCard
                    errorResponse={ orderError }
                    onBackToCart={ () => navigate("/my-cart") }
                    onClose={ () => setOrderError(null) }
                />
            </div>
        );
    }

    if (!dataOrder) return null;

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-5xl px-4 py-8">
                {/* HEADER */ }
                <div className="flex justify-between mb-6">
                    <h1 className="text-2xl font-bold">Xác nhận đơn hàng</h1>
                    <Link to="/cart" className="text-sm text-slate-600 hover:underline">
                        Quay lại giỏ hàng
                    </Link>
                </div>

                <div className="space-y-6">
                    { dataOrder.groups.map((group) => (
                        <ShopOrderCard
                            key={ group.shopId }
                            group={ group }
                            voucher={ shopVouchers[group.shopId] }
                            onSelectVoucher={ () => openVoucher(group.shopId) }
                            onRemoveVoucher={ () => removeShopVoucher(group.shopId) }
                        />
                    )) }
                </div>

                <InvalidItemsBox items={ dataOrder.invalidItems } />

                <DeliveryAddressPicker
                    deliveryAddress={ deliveryAddress }
                    setDeliveryAddress={ setDeliveryAddress }
                    onAddAddress={ () => navigate("/profile") }
                />
                <OrderTotalBox
                    subTotal={ grandSubTotal }
                    shippingFee={ shippingFeeTotal }
                    shipDiscount={ shipDiscount }
                    total={ dataOrder.grandTotal }
                    systemVoucher={ systemVoucher }
                    onPickSystemVoucher={ () => setSystemModalOpen(true) }
                    onSubmit={ handleSubmitOrder }
                    submitting={ submitting }
                    onRemoveSystemVoucher={ removeSystemVoucher }
                />
                <SystemVoucherModal
                    open={ systemModalOpen }
                    onClose={ () => setSystemModalOpen(false) }
                    defaultCode={ systemVoucher || "" }
                    grandSubTotal={ grandSubTotal }
                    shippingFeeTotal={ shippingFeeTotal }
                    onApplied={ handleAppliedSystemVoucher }
                />
            </div>

            <VoucherModal
                open={ voucherModal.open }
                onClose={ closeVoucher }
                shopId={ currentGroup?.shopId }
                shopName={ currentGroup?.shop?.name }
                subTotal={ currentGroup?.subTotal ?? 0 }
                defaultCode={ shopVouchers[currentGroup?.shopId] || "" }
                onApplied={ handleAppliedVoucher }
            />
        </div>
    );
}

export default OrderSummary;
