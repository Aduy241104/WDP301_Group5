import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ReactPaginate from "react-paginate";
import { getMyFollowingShopsAPI, unfollowShopAPI } from "../services/shopFollowService";

export default function FollowingShopsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = Number(searchParams.get("page")) || 1;

    const [followingList, setFollowingList] = useState([]);
    const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });
    const [loading, setLoading] = useState(false);

    const fetchFollowingShops = async () => {
        setLoading(true);
        try {
            const response = await getMyFollowingShopsAPI(currentPage, 12);
            if (response.message === "OK" && response.data) {
                setFollowingList(response.data.items);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            console.error("Lỗi khi tải danh sách shop:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFollowingShops();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage]);

    // Đổi trang
    const handlePageChange = (selectedItem) => {
        const newPage = selectedItem.selected + 1;
        setSearchParams({ page: newPage });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Xử lý bỏ theo dõi (Unfollow)
    const handleUnfollow = async (shopId, shopName) => {
        if (!window.confirm(`Bạn có chắc muốn bỏ theo dõi shop ${shopName}?`)) return;

        try {
            await unfollowShopAPI(shopId);
            // Cập nhật lại list sau khi unfollow thành công (xóa local khỏi state cho nhanh)
            setFollowingList(prev => prev.filter(item => item.shop?._id !== shopId));
            setPagination(prev => ({ ...prev, total: prev.total - 1 }));
        } catch (error) {
            console.error("Lỗi khi bỏ theo dõi:", error);
            alert("Có lỗi xảy ra, vui lòng thử lại sau.");
        }
    };

    // Format ngày theo dõi
    const formatDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("vi-VN");
    };

    return (
        <div className="mx-auto max-w-7xl px-4 pt-32 pb-12 min-h-screen">
            {/* Header */ }
            <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Shop Đang Theo Dõi</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Bạn đang theo dõi <span className="font-semibold text-[rgb(31,192,212)]">{ pagination.total }</span> cửa hàng
                    </p>
                </div>
            </div>

            {/* Content */ }
            { loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-[rgb(119,226,242)] border-t-transparent"></div>
                </div>
            ) : followingList.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100">
                    <div className="text-5xl mb-4">🏪</div>
                    <div className="text-slate-600 font-medium mb-1">Bạn chưa theo dõi Shop nào!</div>
                    <p className="text-sm text-slate-500 mb-6">Hãy theo dõi các shop để cập nhật sản phẩm và khuyến mãi mới nhất.</p>
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center rounded-xl bg-[rgb(119,226,242)] px-6 py-2.5 text-sm font-bold text-slate-900 hover:opacity-90 transition"
                    >
                        Khám phá ngay
                    </Link>
                </div>
            ) : (
                <>
                    {/* Grid List Shops */ }
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        { followingList.map((item) => {
                            const shop = item.shop;
                            if (!shop) return null;

                            return (
                                <div key={ shop._id } className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm hover:shadow-md hover:border-[rgb(119,226,242)] transition group">

                                    {/* Shop Avatar/Logo */ }
                                    <Link to={ `/shop/${shop.slug || shop._id}` } className="flex-shrink-0 relative">
                                        <img
                                            src={ shop.logo || "https://via.placeholder.com/150?text=Shop" }
                                            alt={ shop.name }
                                            className="w-16 h-16 rounded-full object-cover border border-slate-100"
                                        />
                                    </Link>

                                    {/* Shop Info */ }
                                    <div className="flex-1 min-w-0">
                                        <Link to={ `/shop/${shop.slug || shop._id}` }>
                                            <h3 className="text-base font-bold text-slate-800 truncate group-hover:text-[rgb(31,192,212)] transition">
                                                { shop.name }
                                            </h3>
                                        </Link>

                                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                            <span className="flex items-center gap-1">
                                                ⭐ <span className="font-semibold text-slate-700">{ shop.rating?.toFixed(1) || "0.0" }</span>
                                            </span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                            <span><span className="font-semibold text-slate-700">{ shop.totalFollowers || 0 }</span> người theo dõi</span>
                                        </div>

                                        <div className="text-[11px] text-slate-400 mt-1.5">
                                            Đã theo dõi từ: { formatDate(item.followedAt) }
                                        </div>
                                    </div>

                                    {/* Action Buttons */ }
                                    <div className="flex flex-col gap-2 flex-shrink-0">
                                        <Link
                                            to={ `/shop/${shop.slug || shop._id}` }
                                            className="inline-flex items-center justify-center text-xs font-semibold px-3 py-1.5 rounded-lg bg-[rgb(119,226,242)]/20 text-[rgb(31,192,212)] hover:bg-[rgb(119,226,242)] hover:text-slate-900 transition"
                                        >
                                            Xem Shop
                                        </Link>
                                        <button
                                            onClick={ () => handleUnfollow(shop._id, shop.name) }
                                            className="inline-flex items-center justify-center text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition"
                                        >
                                            Bỏ theo dõi
                                        </button>
                                    </div>
                                </div>
                            );
                        }) }
                    </div>

                    {/* Pagination */ }
                    { pagination.totalPages > 1 && (
                        <div className="mt-10 flex flex-col items-center gap-3 mb-8">
                            <ReactPaginate
                                pageCount={ pagination.totalPages }
                                forcePage={ Math.max(0, currentPage - 1) }
                                onPageChange={ handlePageChange }
                                marginPagesDisplayed={ 1 }
                                pageRangeDisplayed={ 3 }
                                breakLabel="…"
                                previousLabel="Trang trước"
                                nextLabel="Trang sau"
                                renderOnZeroPageCount={ null }
                                containerClassName="flex flex-wrap items-center justify-center gap-2"
                                pageClassName="select-none"
                                pageLinkClassName="inline-flex h-10 min-w-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                                activeLinkClassName="!border-sky-300 !bg-sky-50 !text-sky-700"
                                previousClassName="select-none"
                                previousLinkClassName="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                                nextClassName="select-none"
                                nextLinkClassName="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                                breakClassName="select-none"
                                breakLinkClassName="inline-flex h-10 min-w-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-500 shadow-sm"
                                disabledLinkClassName="!opacity-50 !cursor-not-allowed hover:!bg-white"
                            />
                        </div>
                    ) }
                </>
            ) }
        </div>
    );
}