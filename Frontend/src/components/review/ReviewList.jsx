import { useEffect, useState } from "react";
import {
  getProductReviewsAPI,
  deleteReviewAPI,
  updateReviewAPI
} from "../../services/reviewUserService";

import { useAuth } from "../../context/AuthContext";

const ReviewList = ({ productId, reload }) => {

  const { auth } = useAuth();
  const currentUserId = auth?.user?.id;

  const [reviews, setReviews] = useState([]);
  const [ratingFilter, setRatingFilter] = useState("");

  const [editingReview, setEditingReview] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const [openMenuId, setOpenMenuId] = useState(null);

  // 🔥 THÊM
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  const PAGE_SIZE = 5;

  const loadReviews = async (pageNumber = 1) => {
    setLoading(true);

    const res = await getProductReviewsAPI(productId, {
      page: pageNumber,
      rating: ratingFilter,
    });

    const data = res.data; // ✅ FIX đúng structure

    const newReviews = data.reviews || [];
    const total = data.pagination?.total || 0;

    // 🔥 THÊM
    setTotalReviews(total);
    setAvgRating(data.avgRating || 0);

    if (pageNumber === 1) {
      setReviews(newReviews);
    } else {
      setReviews(prev => [...prev, ...newReviews]);
    }

    setHasMore(total > pageNumber * PAGE_SIZE);

    setLoading(false);
  };

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    loadReviews(1);
  }, [reload, ratingFilter]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadReviews(nextPage);
  };

  const handleDelete = async (reviewId) => {
    await deleteReviewAPI(reviewId);
    setPage(1);
    setHasMore(true);
    loadReviews(1);
  };

  const handleUpdate = async () => {
    await updateReviewAPI(editingReview._id, {
      rating: editRating,
      comment: editComment
    });

    setEditingReview(null);
    setPage(1);
    setHasMore(true);
    loadReviews(1);
  };

  return (
    <div className=" mx-auto bg-white rounded-xl shadow-sm border border-gray-100">

      {/* --- HEADER & FILTER SECTION --- */ }
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 pb-6 border-b border-gray-100">

        {/* TỔNG QUAN ĐIỂM SỐ */ }
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Đánh giá sản phẩm</h2>
          <div className="flex items-center gap-3">
            <div className="flex text-yellow-400 text-xl font-bold items-center gap-1">
              <span className="text-3xl text-gray-800 tracking-tight">{ avgRating.toFixed(1) }</span>
              <span className="text-lg">/ 5</span>
            </div>
            <div className="h-8 w-[1px] bg-gray-200 mx-2 hidden sm:block"></div>
            <div className="flex flex-col">
              <div className="flex text-yellow-400 text-sm">
                { "★".repeat(Math.round(avgRating)) + "☆".repeat(5 - Math.round(avgRating)) }
              </div>
              <span className="text-gray-500 text-xs font-medium">
                { totalReviews } đánh giá khách quan
              </span>
            </div>
          </div>
        </div>

        {/* BỘ LỌC (CHIPS) */ }
        <div className="flex flex-wrap gap-2">
          <button
            onClick={ () => setRatingFilter("") }
            className={ `px-5 py-2 rounded-full text-sm font-semibold transition-all border ${ratingFilter === ""
              ? "bg-[#77E2F2] text-white border-[#77E2F2] shadow-md shadow-cyan-100"
              : "bg-white text-gray-600 border-gray-200 hover:border-[#77E2F2] hover:text-[#77E2F2]"
              }` }
          >
            Tất cả
          </button>

          { [5, 4, 3, 2, 1].map((star) => (
            <button
              key={ star }
              onClick={ () => setRatingFilter(star) }
              className={ `flex items-center gap-1 px-4 py-2 rounded-full text-sm font-semibold transition-all border ${Number(ratingFilter) === star
                ? "bg-[#77E2F2] text-white border-[#77E2F2] shadow-md shadow-cyan-100"
                : "bg-white text-gray-600 border-gray-200 hover:border-[#77E2F2] hover:text-[#77E2F2]"
                }` }
            >
              { star } <span className="text-[10px] leading-none text-yellow-500">⭐</span>
            </button>
          )) }
        </div>
      </div>

      {/* --- TRẠNG THÁI TRỐNG --- */ }
      { reviews.length === 0 && (
        <div className="text-center py-16 flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
            <span className="text-2xl text-gray-300">💬</span>
          </div>
          <p className="text-gray-400 font-medium">Chưa có đánh giá nào cho bộ lọc này</p>
        </div>
      ) }

      {/* --- DANH SÁCH ĐÁNH GIÁ --- */ }
      <div className="divide-y divide-gray-100">
        { reviews.map((review) => {
          const isOwner = review.userId?._id?.toString() === currentUserId?.toString();

          return (
            <div key={ review._id } className="relative py-8 first:pt-0 last:pb-0 group">

              {/* Menu Sửa/Xóa cho chủ sở hữu */ }
              { isOwner && (
                <div className="absolute top-8 right-0">
                  <button
                    onClick={ () => setOpenMenuId(openMenuId === review._id ? null : review._id) }
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50 transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>

                  { openMenuId === review._id && (
                    <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-100 rounded-lg shadow-xl z-20 py-1 overflow-hidden">
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 font-medium"
                        onClick={ () => {
                          setEditingReview(review);
                          setEditRating(review.rating);
                          setEditComment(review.comment);
                          setOpenMenuId(null);
                        } }
                      >
                        Sửa đánh giá
                      </button>
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
                        onClick={ () => {
                          handleDelete(review._id);
                          setOpenMenuId(null);
                        } }
                      >
                        Xóa
                      </button>
                    </div>
                  ) }
                </div>
              ) }

              <div className="flex items-start gap-4">
                {/* Avatar */ }
                <img
                  src={ review.userId?.avatar || "/avatar.png" }
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-50 flex-shrink-0"
                  alt="user"
                />

                <div className="flex-1 min-w-0">
                  {/* Info & Rating */ }
                  <div className="mb-2">
                    <p className="font-bold text-gray-900 leading-none mb-1">
                      { review.userId?.fullName }
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex text-yellow-400 text-xs">
                        { "★".repeat(review.rating) }{ "☆".repeat(5 - review.rating) }
                      </div>
                      <span className="text-[11px] text-gray-400 font-medium">
                        { new Date(review.createdAt).toLocaleDateString("vi-VN", {
                          year: 'numeric', month: 'short', day: 'numeric'
                        }) }
                      </span>
                    </div>
                  </div>

                  {/* Comment Box */ }
                  <div className="bg-gray-50/80 p-4 rounded-2xl rounded-tl-none">
                    <p className="text-gray-700 leading-relaxed text-sm">
                      { review.comment }
                    </p>
                  </div>

                  {/* Phản hồi của người bán */ }
                  { review.sellerReply && (
                    <div className="mt-4 ml-6 relative">
                      <div className="absolute -top-3 left-0 w-4 h-4 border-l-2 border-b-2 border-gray-200 rounded-bl-lg"></div>
                      <div className="bg-cyan-50/40 border-l-4 border-[#77E2F2] p-4 rounded-r-xl">
                        <p className="text-xs font-bold text-cyan-700 uppercase tracking-wider mb-1">
                          Phản Hồi Của Người Bán
                        </p>
                        <p className="text-sm text-gray-600 italic leading-relaxed">
                          "{ review.sellerReply.message }"
                        </p>
                      </div>
                    </div>
                  ) }
                </div>
              </div>
            </div>
          );
        }) }
      </div>

      {/* --- LOAD MORE --- */ }
      { hasMore && reviews.length > 0 && (
        <div className="text-center mt-10 pt-6 border-t border-gray-50">
          <button
            onClick={ handleLoadMore }
            disabled={ loading }
            className="inline-flex items-center px-8 py-2.5 bg-white border border-gray-200 text-gray-600 font-semibold rounded-full hover:border-[#77E2F2] hover:text-[#77E2F2] transition-all disabled:opacity-50"
          >
            { loading ? (
              <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null }
            { loading ? "Đang tải..." : "Xem thêm bình luận" }
          </button>
        </div>
      ) }
    </div>
  );
};

export default ReviewList;