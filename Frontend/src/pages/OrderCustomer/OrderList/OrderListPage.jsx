import { useEffect, useMemo, useState } from "react";
import OrderTabs from "./components/OrderTabs";
import OrderSearchBar from "./components/OrderSearchBar";
import OrderCard from "./components/OrderCard";
import PaginationBar from "./components/PaginationBar";
import { getMyOrderListAPI } from "../../../services/orderCustomerServices";
import ReviewForm from "../../../components/review/ReviewForm";

const DEFAULT_LIMIT = 5;
const DEFAULT_STATUS = "created";

export default function OrderListPage() {
    const [status, setStatus] = useState(DEFAULT_STATUS);
    const [keyword, setKeyword] = useState("");
    const [page, setPage] = useState(1);
    const [reload, setReload] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [orders, setOrders] = useState([]);
    const [openReview, setOpenReview] = useState(false);
    const [reviewProducts, setReviewProducts] = useState([]);
    const [reviewOrderId, setReviewOrderId] = useState(null);
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

                // CHỈNH SỬA TẠI ĐÂY: Truyền thêm query.keyword làm tham số thứ 4
                const res = await getMyOrderListAPI(
                    query.page,
                    query.limit,
                    query.status,
                    query.keyword
                );

                if (!mounted) return;

                setOrders(res?.orders || []);
                // Đảm bảo set pagination từ res để cập nhật tổng số trang khi search
                setPagination(res?.pagination || {
                    ...pagination,
                    total: 0,
                    totalPages: 1
                });
            } catch (e) {
                if (!mounted) return;
                setError(e?.response?.data?.message || e?.message || "Có lỗi xảy ra");
                setOrders([]); // Xóa list cũ nếu lỗi
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query, reload]);

    const handleReload = () => {
        setReload(!reload);
    };

    const handleChangeStatus = (nextStatus) => {
        setStatus(nextStatus);
        setPage(1); // Reset về trang 1 khi đổi tab
    };

    const handleSearch = (value) => {
        setKeyword(value);
        setPage(1); // Reset về trang 1 khi tìm kiếm mới
    };

    const handlePageChange = (selectedPageIndex) => {
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
                                        onViewShop={ () => console.log("view shop", o.shop?._id) }
                                        onRebuy={ () => console.log("rebuy", o._id) }
                                        onReview={ () => {
                                            setReviewProducts(o.items);
                                            setReviewOrderId(o._id);
                                            setOpenReview(true);
                                        } }
                                        onReturn={ () => console.log("return", o._id) }
                                        onReload={ handleReload }
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

                {/* Phần Review Modal giữ nguyên như code của bạn */ }
                { openReview && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg w-[550px] relative shadow-lg max-h-[80vh] overflow-y-auto">
                            <button
                                className="absolute top-3 right-3 text-gray-500 hover:text-black text-lg"
                                onClick={ () => setOpenReview(false) }
                            >
                                ✕
                            </button>
                            <h3 className="text-lg font-semibold mb-4">Đánh giá sản phẩm</h3>
                            <div className="space-y-6">
                                { reviewProducts.map((item) => (
                                    <div key={ item.productId } className="border-b pb-6">
                                        <div className="flex items-center gap-4 mb-3">
                                            <img
                                                src={ item.product?.images?.[0] || "https://via.placeholder.com/80" }
                                                className="w-16 h-16 object-cover rounded border"
                                                alt="product"
                                            />
                                            <div className="flex-1">
                                                <p className="font-medium text-sm">{ item.product?.name || "Sản phẩm" }</p>
                                                <p className="text-red-500 font-semibold text-sm">
                                                    { Number(item.price).toLocaleString("vi-VN") }₫
                                                </p>
                                            </div>
                                        </div>
                                        <ReviewForm
                                            productId={ item.productId }
                                            orderId={ reviewOrderId }
                                            reloadReviews={ () => {
                                                setOpenReview(false);
                                                handleReload();
                                            } }
                                        />
                                    </div>
                                )) }
                            </div>
                        </div>
                    </div>
                ) }
            </div>
        </div>
    );
}