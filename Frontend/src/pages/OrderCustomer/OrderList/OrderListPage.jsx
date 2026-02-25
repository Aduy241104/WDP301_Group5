import { useEffect, useMemo, useState } from "react";
import OrderTabs from "./components/OrderTabs";
import OrderSearchBar from "./components/OrderSearchBar";
import OrderCard from "./components/OrderCard";
import PaginationBar from "./components/PaginationBar";
import { getMyOrderListAPI } from "../../../services/orderCustomerServices";

const DEFAULT_LIMIT = 5;
const DEFAULT_STATUS = "created";

export default function OrderListPage() {
    const [status, setStatus] = useState(DEFAULT_STATUS);
    const [keyword, setKeyword] = useState("");
    const [page, setPage] = useState(1);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [orders, setOrders] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: DEFAULT_LIMIT,
        total: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
    });

    const query = useMemo(
        () => ({
            status,
            page,
            limit: DEFAULT_LIMIT,
            keyword: keyword?.trim() || "",
        }),
        [status, page, keyword]
    );

    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                setLoading(true);
                setError("");
                const res = await getMyOrderListAPI(query.page, query.limit, query.status);

                if (!mounted) return;

                setOrders(res?.orders || []);
                setPagination(res?.pagination || pagination);
            } catch (e) {
                if (!mounted) return;
                setError(e?.response?.data?.message || e?.message || "Có lỗi xảy ra");
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);

    const handleChangeStatus = (nextStatus) => {
        setStatus(nextStatus);
        setPage(1);
    };

    const handleSearch = (value) => {
        setKeyword(value);
        setPage(1);
    };

    const handlePageChange = (selectedPageIndex) => {
        // react-paginate trả index bắt đầu từ 0
        setPage(selectedPageIndex + 1);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-5xl px-4 py-8">
                <div className="mb-5 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-slate-900">Đơn mua</h1>
                </div>

                <div className="rounded-sm border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-4 pt-3">
                        <OrderTabs value={ status } onChange={ handleChangeStatus } />
                        <div className="pb-4 pt-3">
                            <OrderSearchBar value={ keyword } onChange={ handleSearch } />
                        </div>
                    </div>

                    <div className="p-4">
                        { loading && (
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center text-slate-600">
                                Đang tải đơn hàng...
                            </div>
                        ) }

                        { !loading && error && (
                            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                                { error }
                            </div>
                        ) }

                        { !loading && !error && orders.length === 0 && (
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-600">
                                Không có đơn hàng phù hợp.
                            </div>
                        ) }

                        { !loading && !error && orders.length > 0 && (
                            <div className="space-y-4">
                                { orders.map((o) => (
                                    <OrderCard
                                        key={ o._id }
                                        order={ o }
                                        onChat={ () => console.log("chat", o._id) }
                                        onViewShop={ () => console.log("view shop", o.shop?._id) }
                                        onRebuy={ () => console.log("rebuy", o._id) }
                                        onReview={ () => console.log("review", o._id) }
                                        onReturn={ () => console.log("return", o._id) }
                                        onMore={ () => console.log("more", o._id) }
                                    />
                                )) }
                            </div>
                        ) }

                        <div className="mt-6">
                            <PaginationBar
                                page={ pagination.page }
                                totalPages={ pagination.totalPages }
                                onPageChange={ handlePageChange }
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
