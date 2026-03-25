import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ReactPaginate from "react-paginate"; // Import thư viện
import { searchProductsAPI } from "../../services/productDiscoveryService";
import ProductCard from "../../components/product/ProductCard";

export default function SearchResultPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const keyword = searchParams.get("keyword") || "";
    console.log("KEYWORD:", keyword);
    
    const currentPage = Number(searchParams.get("page")) || 1;

    const minPriceParam = searchParams.get("minPrice") || "";
    const maxPriceParam = searchParams.get("maxPrice") || "";
    const minRatingParam = searchParams.get("minRating") || "";

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    // Gom chung total và totalPages vào 1 state
    const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });

    const [filterMinPrice, setFilterMinPrice] = useState(minPriceParam);
    const [filterMaxPrice, setFilterMaxPrice] = useState(maxPriceParam);

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            try {
                const filters = {
                    keyword,
                    page: currentPage,
                    limit: 5,
                };

                if (minPriceParam) filters.minPrice = minPriceParam;
                if (maxPriceParam) filters.maxPrice = maxPriceParam;
                if (minRatingParam) filters.minRating = minRatingParam;

                const response = await searchProductsAPI(filters);

                if (response.success) {
                    setProducts(response.data.items);
                    setPagination({
                        total: response.data.total,
                        totalPages: response.data.totalPages
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

    // Handle đổi trang (dành cho ReactPaginate)
    const handlePageChange = (selectedItem) => {
        // ReactPaginate trả về object { selected: index }, trong đó index bắt đầu từ 0
        // Nên ta phải +1 để ra được số trang thực tế
        const newPage = selectedItem.selected + 1;

        const newParams = new URLSearchParams(searchParams);
        newParams.set("page", newPage);
        setSearchParams(newParams);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleApplyFilter = (e) => {
        e.preventDefault();
        const newParams = new URLSearchParams(searchParams);
        newParams.set("page", 1);

        if (filterMinPrice) newParams.set("minPrice", filterMinPrice);
        else newParams.delete("minPrice");

        if (filterMaxPrice) newParams.set("maxPrice", filterMaxPrice);
        else newParams.delete("maxPrice");

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
            <div className="w-full md:w-64 flex-shrink-0">
                <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm sticky top-24">
                    <h2 className="text-sm font-bold flex items-center gap-2 mb-4 text-slate-800">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M4 6H20M6 12H18M10 18H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        BỘ LỌC TÌM KIẾM
                    </h2>

                    <div className="h-px bg-slate-100 my-4" />

                    {/* Lọc Giá */ }
                    <div className="mb-6">
                        <h3 className="text-xs font-semibold text-slate-700 mb-3">Khoảng Giá</h3>
                        <form onSubmit={ handleApplyFilter } className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    placeholder="TỪ"
                                    value={ filterMinPrice }
                                    onChange={ (e) => setFilterMinPrice(e.target.value) }
                                    className="w-full h-8 px-2 text-xs border border-slate-300 rounded focus:outline-none focus:border-[rgb(119,226,242)]"
                                />
                                <span className="text-slate-400">-</span>
                                <input
                                    type="number"
                                    placeholder="ĐẾN"
                                    value={ filterMaxPrice }
                                    onChange={ (e) => setFilterMaxPrice(e.target.value) }
                                    className="w-full h-8 px-2 text-xs border border-slate-300 rounded focus:outline-none focus:border-[rgb(119,226,242)]"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full mt-2 h-8 bg-[rgb(119,226,242)] text-slate-800 text-xs font-bold rounded hover:opacity-90 transition"
                            >
                                ÁP DỤNG
                            </button>
                        </form>
                    </div>

                    <div className="h-px bg-slate-100 my-4" />

                    {/* Lọc Đánh Giá */ }
                    <div>
                        <h3 className="text-xs font-semibold text-slate-700 mb-3">Đánh Giá</h3>
                        <div className="flex flex-col gap-2">
                            { [5, 4, 3].map((star) => (
                                <button
                                    key={ star }
                                    onClick={ () => handleRatingFilter(String(star)) }
                                    className={ `flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition ${minRatingParam === String(star) ? "bg-slate-100 font-bold" : "hover:bg-slate-50"
                                        }` }
                                >
                                    <div className="flex text-yellow-400 text-xs">
                                        { Array(star).fill('⭐') }
                                    </div>
                                    <span className="text-slate-600 text-xs mt-0.5">Trở lên</span>
                                </button>
                            )) }
                        </div>
                    </div>
                </div>
            </div>

            {/* CỘT PHẢI: KẾT QUẢ */ }
            <div className="flex-1">
                <div className="mb-6 flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm">
                    <h1 className="text-base text-slate-700">
                        { keyword ? (
                            <>Kết quả cho: <span className="font-bold text-[rgb(31,192,212)]">"{ keyword }"</span></>
                        ) : (
                            <span className="font-bold">Tất cả sản phẩm</span>
                        ) }
                    </h1>
                    <span className="text-sm font-medium text-slate-500">{ pagination.total } sản phẩm</span>
                </div>

                { loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[rgb(119,226,242)] border-t-transparent"></div>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100">
                        <div className="text-5xl mb-4">🔍</div>
                        <div className="text-slate-600 font-medium mb-1">Không tìm thấy sản phẩm nào!</div>
                        <p className="text-sm text-slate-500">Hãy thử xóa bộ lọc hoặc dùng từ khóa khác.</p>

                        { (minPriceParam || maxPriceParam || minRatingParam) && (
                            <button
                                onClick={ () => setSearchParams({ keyword: keyword || "" }) }
                                className="mt-4 px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
                            >
                                Xóa tất cả bộ lọc
                            </button>
                        ) }
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                            { products.map((product) => (
                                <ProductCard key={ product._id } product={ product } />
                            )) }
                        </div>

                        {/* REACT PAGINATE */ }
                        { pagination.totalPages > 1 && (
                            <div className="mt-10 flex flex-col items-center gap-3 mb-8">
                                <ReactPaginate
                                    pageCount={ pagination.totalPages }
                                    // ReactPaginate nhận index từ 0, nên phải trừ 1
                                    forcePage={ Math.max(0, currentPage - 1) }
                                    onPageChange={ handlePageChange }
                                    marginPagesDisplayed={ 1 }
                                    pageRangeDisplayed={ 3 }
                                    breakLabel="…"
                                    previousLabel="Trang trước"
                                    nextLabel="Trang sau"
                                    renderOnZeroPageCount={ null }

                                    // Styling Tailwind như bạn cung cấp
                                    containerClassName="flex flex-wrap items-center justify-center gap-2"
                                    pageClassName="select-none"
                                    pageLinkClassName="inline-flex h-10 min-w-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                                    activeLinkClassName="!border-sky-300 !bg-sky-50 !text-sky-700" // Có thể đổi .sky thành .cyan nếu muốn tông xanh của bạn
                                    previousClassName="select-none"
                                    previousLinkClassName="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                                    nextClassName="select-none"
                                    nextLinkClassName="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                                    breakClassName="select-none"
                                    breakLinkClassName="inline-flex h-10 min-w-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-500 shadow-sm"
                                    disabledLinkClassName="!opacity-50 !cursor-not-allowed hover:!bg-white"
                                />

                                <div className="text-xs text-slate-500">
                                    Trang <span className="font-semibold text-slate-700">{ currentPage }</span> /{ " " }
                                    <span className="font-semibold text-slate-700">{ pagination.totalPages }</span>
                                </div>
                            </div>
                        ) }
                    </>
                ) }
            </div>
        </div>
    );
}