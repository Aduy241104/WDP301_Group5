import { useEffect, useRef, useState } from "react";
import ReactPaginate from "react-paginate";
import ProductCard from "../components/product/ProductCard"; // chỉnh path
import { getTopSaleProductAPI } from "../services/productDiscoveryService";
import ProductCardSkeleton from "../components/common/ProductCardSkeleton";

export default function TopSaleProduct() {
    const topRef = useRef(null);

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(2);

    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchTopSale = async ({ page: p = page, limit: l = limit } = {}) => {
        setLoading(true);
        setError("");

        try {
            const data = await getTopSaleProductAPI({ page: p, limit: l });

            setItems(Array.isArray(data?.items) ? data.items : []);
            setTotal(Number(data?.total || 0));
            setTotalPages(Number(data?.totalPages || 1));

            setPage(Number(data?.page || 1));
            setLimit(Number(data?.limit || l));
        } catch (e) {
            const msg =
                e?.response?.data?.message ||
                e?.message ||
                "Có lỗi xảy ra khi tải top sale.";
            setError(msg);
            setItems([]);
            setTotal(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTopSale({ page, limit });
    }, [page, limit]);

    const handlePageChange = (selectedItem) => {
        const nextPage = (selectedItem?.selected ?? 0) + 1;
        setPage(nextPage);

        requestAnimationFrame(() => {
            topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div ref={ topRef } className="mx-auto max-w-6xl px-4 py-8">
                {/* Header */ }
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                            Top sản phẩm bán chạy
                        </h1>
                        <p className="mt-1 text-sm text-slate-600">
                            { loading
                                ? "Đang tải..."
                                : `Tổng: ${total.toLocaleString("vi-VN")} sản phẩm` }
                        </p>
                    </div>
                </div>
                { error && (
                    <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        { error }
                    </div>
                ) }

                {/* Loading */ }
                { loading && (
                    <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        { Array.from({ length: 8 }).map((_, i) => (
                            <ProductCardSkeleton key={ i } />
                        )) }
                    </div>
                ) }

                {/* Empty */ }
                { !loading && !error && items.length === 0 && (
                    <div className="mt-10 rounded-3xl border border-slate-100 bg-white p-10 text-center shadow-sm">
                        <div className="text-base font-semibold text-slate-900">
                            Không có sản phẩm nào
                        </div>
                        <div className="mt-1 text-sm text-slate-600">
                            Thử đổi limit hoặc làm mới.
                        </div>
                    </div>
                ) }

                {/* Grid */ }
                { !loading && !error && items.length > 0 && (
                    <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        { items.map((p) => (
                            <ProductCard key={ p?._id } product={ p } />
                        )) }
                    </div>
                ) }

                {/* Pagination dạng nút bấm dưới cùng */ }
                { !loading && !error && totalPages > 1 && (
                    <div className="mt-10 flex flex-col items-center gap-3">
                        <ReactPaginate
                            pageCount={ totalPages }
                            forcePage={ Math.max(0, page - 1) }
                            onPageChange={ handlePageChange }
                            marginPagesDisplayed={ 1 }
                            pageRangeDisplayed={ 3 }
                            breakLabel="…"
                            previousLabel="Trang trước"
                            nextLabel="Trang sau"
                            renderOnZeroPageCount={ null }
                            containerClassName="flex flex-wrap items-center justify-center gap-2"
                            // mỗi "li" là 1 nút
                            pageClassName="select-none"
                            pageLinkClassName="inline-flex h-10 min-w-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                            activeLinkClassName="!border-sky-300 !bg-sky-50 !text-sky-700"
                            // nút prev/next
                            previousClassName="select-none"
                            previousLinkClassName="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                            nextClassName="select-none"
                            nextLinkClassName="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                            // break
                            breakClassName="select-none"
                            breakLinkClassName="inline-flex h-10 min-w-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-500 shadow-sm"
                            // disabled
                            disabledLinkClassName="!opacity-50 !cursor-not-allowed hover:!bg-white"
                        />

                        <div className="text-xs text-slate-500">
                            Trang <span className="font-semibold text-slate-700">{ page }</span> /{ " " }
                            <span className="font-semibold text-slate-700">{ totalPages }</span>
                        </div>
                    </div>
                ) }
            </div>
        </div>
    );
}
