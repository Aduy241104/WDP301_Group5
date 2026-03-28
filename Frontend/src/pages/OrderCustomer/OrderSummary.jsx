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
    const [baseShopSubTotals, setBaseShopSubTotals] = useState({});

    const [voucherModal, setVoucherModal] = useState({ open: false, shopId: null });
    const [submitting, setSubmitting] = useState(false);

    const [deliveryAddress, setDeliveryAddress] = useState(null);

    // THÊM: State để quản lý modal cảnh báo địa chỉ rỗng
    const [addressModalOpen, setAddressModalOpen] = useState(false);

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
        setDataOrder((prev) => {
            if (!prev) return prev;
            const groups = prev.groups || [];
            const newGrandTotal = recomputeGrandTotal(groups, prev.shippingFee ?? 0, 0);
            return { ...prev, grandTotal: newGrandTotal };
        });
    };

    const handleSubmitOrder = async () => {
        // KIỂM TRA ĐỊA CHỈ: Nếu rỗng thì mở modal và dừng thực thi
        if (!deliveryAddress) {
            setAddressModalOpen(true);
            return;
        }

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

    if (loading) return <div className="p-8 text-center text-slate-500">Đang chuẩn bị đơn hàng...</div>;
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
            <div className="mx-auto max-w-5xl px-4 py-8 relative">
                <div className="flex justify-between mb-6">
                    <h1 className="text-2xl font-bold text-slate-900">Xác nhận đơn hàng</h1>
                    <Link to="/cart" className="text-sm text-slate-600 hover:text-blue-600">
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

            {/* MODAL CẢNH BÁO THIẾU ĐỊA CHỈ */ }
            { addressModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl text-center">
                        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={ 1.5 } stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Chưa có địa chỉ nhận hàng</h3>
                        <p className="text-slate-500 mb-6 text-sm">
                            Vui lòng chọn hoặc thêm địa chỉ giao hàng để chúng tôi có thể vận chuyển đơn hàng đến bạn.
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={ () => navigate("/profile") }
                                className="w-full rounded-xl bg-blue-600 py-2.5 font-semibold text-white hover:bg-blue-700 transition-colors"
                            >
                                Thêm địa chỉ mới
                            </button>
                            <button
                                onClick={ () => setAddressModalOpen(false) }
                                className="w-full rounded-xl bg-slate-100 py-2.5 font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
                            >
                                Quay lại
                            </button>
                        </div>
                    </div>
                </div>
            ) }
        </div>
    );
}

export default OrderSummary;