// pages/OrderSummary.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { createOrder } from "../../services/orderCustomerServices";

import ShopOrderCard from "../../components/order/ShopOrderCard";
import InvalidItemsBox from "../../components/order/InvalidItemsBox";
import OrderTotalBox from "../../components/order/OrderTotalBox";

function OrderSummary() {
    const { state } = useLocation();

    const [dataOrder, setDataOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // voucher UI state (chưa dùng BE)
    const [shopVouchers, setShopVouchers] = useState({});

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

    useEffect(() => {
        const handleCreateOrder = async () => {
            try {
                setLoading(true);
                setError("");

                const res = await createOrder({ variantIds });
                setDataOrder(res);

                // init voucher map
                const init = {};
                res.groups.forEach((g) => {
                    init[g.shopId] = null;
                });
                setShopVouchers(init);
            } catch (err) {
                setError(err.message || "Có lỗi xảy ra");
            } finally {
                setLoading(false);
            }
        };

        handleCreateOrder();
    }, [variantIds]);

    if (loading) return <div className="p-8 text-center">Đang tạo đơn hàng…</div>;
    if (error) return <div className="p-8 text-center text-red-600">{ error }</div>;
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

                {/* SHOPS */ }
                <div className="space-y-6">
                    { dataOrder.groups.map((group) => (
                        <ShopOrderCard
                            key={ group.shopId }
                            group={ group }
                            voucher={ shopVouchers[group.shopId] }
                            onSelectVoucher={ () =>
                                setShopVouchers((prev) => ({
                                    ...prev,
                                    [group.shopId]: "VOUCHER_SAMPLE",
                                }))
                            }
                        />
                    )) }
                </div>

                {/* INVALID ITEMS */ }
                <InvalidItemsBox items={ dataOrder.invalidItems } />

                {/* TOTAL */ }
                <OrderTotalBox
                    total={ dataOrder.grandTotal }
                    onSubmit={ () => alert("Đặt hàng (demo)") }
                />
            </div>
        </div>
    );
}

export default OrderSummary;
