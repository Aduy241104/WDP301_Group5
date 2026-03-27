import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ReactPaginate from "react-paginate";
import { searchProductsAPI } from "../../services/productDiscoveryService";
import ProductCard from "../../components/product/ProductCard";

// Các mốc giá gợi ý
const PREDEFINED_PRICE_RANGES = [
    { label: "Dưới 100.000đ", min: "", max: "100000" },
    { label: "Từ 100k - 500k", min: "100000", max: "500000" },
    { label: "Từ 500k - 1 Triệu", min: "500000", max: "1000000" },
    { label: "Trên 1 Triệu", min: "1000000", max: "" },
];

export default function SearchResultPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const keyword = searchParams.get("keyword") || "";

    const currentPage = Number(searchParams.get("page")) || 1;
    const minPriceParam = searchParams.get("minPrice") || "";
    const maxPriceParam = searchParams.get("maxPrice") || "";
    const minRatingParam = searchParams.get("minRating") || "";

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });

    const [filterMinPrice, setFilterMinPrice] = useState(minPriceParam);
    const [filterMaxPrice, setFilterMaxPrice] = useState(maxPriceParam);
    const [priceError, setPriceError] = useState("");

    useEffect(() => {
        // Mỗi khi URL thay đổi, đồng bộ lại state của ô input
        setFilterMinPrice(minPriceParam);
        setFilterMaxPrice(maxPriceParam);
        setPriceError("");

        const fetchResults = async () => {
            setLoading(true);
            try {
                const filters = {
                    keyword,
                    page: currentPage,
                    limit: 10,
                };

                if (minPriceParam) filters.minPrice = minPriceParam;
                if (maxPriceParam) filters.maxPrice = maxPriceParam;
                if (minRatingParam) filters.minRating = minRatingParam;

                const response = await searchProductsAPI(filters);

                if (response.success) {
                    setProducts(response.data.items);
                    setPagination({
                        total: response.data.total,
                        totalPages: response.data.totalPages,
                    });
                }
            } catch (error) {
                console.error("Lỗi khi tìm kiếm sản phẩm:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [keyword, currentPage, minPriceParam, maxPriceParam, minRatingParam]);

    const handlePageChange = (selectedItem) => {
        const newPage = selectedItem.selected + 1;
        const newParams = new URLSearchParams(searchParams);
        newParams.set("page", newPage);
        setSearchParams(newParams);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleApplyCustomPrice = (e) => {
        e.preventDefault();
        setPriceError("");

        const min = filterMinPrice !== "" ? Number(filterMinPrice) : null;
        const max = filterMaxPrice !== "" ? Number(filterMaxPrice) : null;

        if (min !== null && min < 0) return setPriceError("Giá tối thiểu không hợp lệ.");
        if (max !== null && max < 0) return setPriceError("Giá tối đa không hợp lệ.");
        if (min !== null && max !== null && min > max) {
            return setPriceError("Giá TỪ không được lớn hơn giá ĐẾN.");
        }

        const newParams = new URLSearchParams(searchParams);
        newParams.set("page", 1);

        if (filterMinPrice) newParams.set("minPrice", filterMinPrice);
        else newParams.delete("minPrice");

        if (filterMaxPrice) newParams.set("maxPrice", filterMaxPrice);
        else newParams.delete("maxPrice");

        setSearchParams(newParams);
    };

    const handlePickPredefinedPrice = (min, max) => {
        setPriceError("");
        const newParams = new URLSearchParams(searchParams);
        newParams.set("page", 1);

        if (minPriceParam === min && maxPriceParam === max) {
            newParams.delete("minPrice");
            newParams.delete("maxPrice");
        } else {
            if (min) newParams.set("minPrice", min);
            else newParams.delete("minPrice");

            if (max) newParams.set("maxPrice", max);
            else newParams.delete("maxPrice");
        }

        setSearchParams(newParams);
    };

    const handleRatingFilter = (rating) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set("page", 1);

        if (rating === minRatingParam) newParams.delete("minRating");
        else newParams.set("minRating", rating);

        setSearchParams(newParams);
    };

    return (
        <div className="mx-auto max-w-7xl px-4 pt-10 pb-12 min-h-screen flex flex-col md:flex-row gap-6">
            {/* CỘT TRÁI: BỘ LỌC */ }
            <div className="w-full md:w-[280px] flex-shrink-0">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm sticky top-24">
                    <h2 className="text-sm font-bold flex items-center gap-2 mb-4 text-slate-800">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M4 6H20M6 12H18M10 18H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        BỘ LỌC TÌM KIẾM
                    </h2>

                    <div className="h-px bg-slate-100 my-4" />

                    {/* Lọc Giá */ }
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-slate-700 mb-3">Khoảng Giá</h3>

                        <div className="flex flex-wrap gap-2 mb-4">
                            { PREDEFINED_PRICE_RANGES.map((range, idx) => {
                                const isActive = minPriceParam === range.min && maxPriceParam === range.max;
                                return (
                                    <button
                                        key={ idx }
                                        onClick={ () => handlePickPredefinedPrice(range.min, range.max) }
                                        className={ `px-3 py-1.5 text-xs font-medium rounded-lg border transition ${isActive
                                                ? "bg-sky-50 border-sky-400 text-sky-700"
                                                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                            }` }
                                    >
                                        { range.label }
                                    </button>
                                );
                            }) }
                        </div>

                        <form onSubmit={ handleApplyCustomPrice } className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="₫ TỪ"
                                    value={ filterMinPrice }
                                    onChange={ (e) => setFilterMinPrice(e.target.value) }
                                    className="w-full h-9 px-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-400 transition"
                                />
                                <span className="text-slate-400 font-medium">-</span>
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="₫ ĐẾN"
                                    value={ filterMaxPrice }
                                    onChange={ (e) => setFilterMaxPrice(e.target.value) }
                                    className="w-full h-9 px-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-400 transition"
                                />
                            </div>

                            { priceError && (
                                <p className="text-red-500 text-[11px] font-medium mt-1">{ priceError }</p>
                            ) }

                            <button
                                type="submit"
                                className="w-full mt-2 h-9 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition"
                            >
                                ÁP DỤNG MỨC GIÁ
                            </button>
                        </form>
                    </div>

                    <div className="h-px bg-slate-100 my-4" />

                    {/* Lọc Đánh Giá */ }
                    <div>
                        <h3 className="text-sm font-semibold text-slate-700 mb-3">Đánh Giá</h3>
                        <div className="flex flex-col gap-1.5">
                            { [5, 4, 3, 2, 1].map((star) => {
                                const isActive = minRatingParam === String(star);
                                return (
                                    <button
                                        key={ star }
                                        onClick={ () => handleRatingFilter(String(star)) }
                                        className={ `flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition border ${isActive
                                                ? "bg-amber-50 border-amber-200 font-medium"
                                                : "bg-white border-transparent hover:bg-slate-50"
                                            }` }
                                    >
                                        <div className="flex text-sm">
                                            {/* Render sao vàng */ }
                                            { Array(star).fill(<span className="text-amber-400">⭐</span>) }
                                            {/* Render sao xám cho đủ 5 sao */ }
                                            { Array(5 - star).fill(<span className="text-slate-200 grayscale opacity-50">⭐</span>) }
                                        </div>
                                        <span className={ isActive ? "text-amber-700" : "text-slate-600" }>
                                            { star === 5 ? "" : "Trở lên" }
                                        </span>
                                    </button>
                                );
                            }) }
                        </div>
                    </div>
                </div>
            </div>

            {/* CỘT PHẢI: KẾT QUẢ */ }
            <div className="flex-1">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4 bg-white px-5 py-4 rounded-2xl border border-slate-200 shadow-sm">
                    <h1 className="text-base text-slate-700">
                        { keyword ? (
                            <>Kết quả cho: <span className="font-bold text-slate-900">"{ keyword }"</span></>
                        ) : (
                            <span className="font-bold text-slate-900">Tất cả sản phẩm</span>
                        ) }
                    </h1>
                    <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
                        { pagination.total } sản phẩm
                    </span>
                </div>

                { loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-sky-400 border-t-transparent"></div>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-200">
                        <div className="text-5xl mb-4">🔍</div>
                        <div className="text-slate-800 font-semibold mb-2">Không tìm thấy sản phẩm nào!</div>
                        <p className="text-sm text-slate-500 mb-6">Hãy thử xóa bộ lọc hoặc dùng từ khóa khác.</p>

                        { (minPriceParam || maxPriceParam || minRatingParam) && (
                            <button
                                onClick={ () => setSearchParams({ keyword: keyword || "" }) }
                                className="px-5 py-2.5 bg-sky-50 text-sky-700 font-medium border border-sky-200 rounded-xl text-sm hover:bg-sky-100 transition"
                            >
                                Xóa tất cả bộ lọc
                            </button>
                        ) }
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            { products.map((product) => (
                                <ProductCard key={ product._id } product={ product } />
                            )) }
                        </div>

                        {/* REACT PAGINATE */ }
                        { pagination.totalPages > 1 && (
                            <div className="mt-12 flex flex-col items-center gap-3 mb-8">
                                <ReactPaginate
                                    pageCount={ pagination.totalPages }
                                    forcePage={ Math.max(0, currentPage - 1) }
                                    onPageChange={ handlePageChange }
                                    marginPagesDisplayed={ 1 }
                                    pageRangeDisplayed={ 3 }
                                    breakLabel="..."
                                    previousLabel="Trang trước"
                                    nextLabel="Trang sau"
                                    renderOnZeroPageCount={ null }
                                    containerClassName="flex flex-wrap items-center justify-center gap-2"
                                    pageClassName="select-none"
                                    pageLinkClassName="inline-flex h-10 min-w-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition"
                                    activeLinkClassName="!border-sky-400 !bg-sky-50 !text-sky-700 font-bold"
                                    previousClassName="select-none"
                                    previousLinkClassName="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
                                    nextClassName="select-none"
                                    nextLinkClassName="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
                                    breakClassName="select-none"
                                    breakLinkClassName="inline-flex h-10 min-w-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-500 shadow-sm"
                                    disabledLinkClassName="!opacity-50 !cursor-not-allowed hover:!bg-white"
                                />
                                <div className="text-xs text-slate-500 font-medium">
                                    Trang <span className="text-slate-800">{ currentPage }</span> / { pagination.totalPages }
                                </div>
                            </div>
                        ) }
                    </>
                ) }
            </div>
        </div>
    );
}