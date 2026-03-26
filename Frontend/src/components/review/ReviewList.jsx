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
    <div>

      {/* 🔥 THÊM HIỂN THỊ SAO TRUNG BÌNH */}
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-3">
        Đánh giá sản phẩm

        <span className="text-yellow-500 font-bold">
          ⭐ {avgRating.toFixed(1)}
        </span>

        <span className="text-gray-500 text-sm font-normal">
          / 5 • {totalReviews} đánh giá
        </span>
      </h2>

      {/* FILTER */}
      <div className="flex gap-2 mb-6">

        <button
          onClick={() => setRatingFilter("")}
          className={`border px-3 py-1 rounded transition
      ${ratingFilter === ""
              ? "bg-[#77E2F2] text-white border-[#77E2F2]"
              : "hover:bg-gray-100"}
    `}
        >
          All
        </button>

        {[5, 4, 3, 2, 1].map((star) => (

          <button
            key={star}
            onClick={() => setRatingFilter(star)}
            className={`border px-3 py-1 rounded transition
        ${Number(ratingFilter) === star
                ? "bg-[#77E2F2] text-white border-[#77E2F2]"
                : "hover:bg-gray-100"}
      `}
          >
            {star}⭐
          </button>

        ))}

      </div>

      {/* NO REVIEW */}
      {reviews.length === 0 && (
        <div className="text-center py-10 text-gray-400">
          Chưa có đánh giá
        </div>
      )}

      {/* REVIEW LIST */}
      {reviews.map((review) => {

        const isOwner = review.userId?._id?.toString() === currentUserId?.toString();

        return (

          <div
            key={review._id}
            className="relative border-b py-6"
          >

            {isOwner && (
              <div className="absolute top-2 right-2">

                <button
                  onClick={() =>
                    setOpenMenuId(openMenuId === review._id ? null : review._id)
                  }
                  className="text-gray-500 text-xl px-2"
                >
                  ⋮
                </button>

                {openMenuId === review._id && (

                  <div className="absolute right-0 mt-1 w-28 bg-white border rounded shadow-lg z-10">

                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-blue-500"
                      onClick={() => {
                        setEditingReview(review);
                        setEditRating(review.rating);
                        setEditComment(review.comment);
                        setOpenMenuId(null);
                      }}
                    >
                      Sửa
                    </button>

                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
                      onClick={() => {
                        handleDelete(review._id);
                        setOpenMenuId(null);
                      }}
                    >
                      Xóa
                    </button>

                  </div>

                )}

              </div>
            )}

            <div className="flex items-start gap-4">

              <img
                src={review.userId?.avatar || "/avatar.png"}
                className="w-12 h-12 rounded-full object-cover"
              />

              <div className="flex-1">

                <p className="font-semibold">
                  {review.userId?.fullName}
                </p>

                <div className="text-red-500 text-sm">
                  {"⭐".repeat(review.rating)}
                </div>

                {new Date(review.createdAt).toLocaleString("sv-SE", {
                  timeZone: "Asia/Ho_Chi_Minh",
                }).replace("T", " ").slice(0, 16)}

                <div className="mt-3 bg-gray-200 p-3 rounded-md">
                  <p className="text-gray-800">
                    {review.comment}
                  </p>
                </div>

                {review.sellerReply && (

                  <div className="bg-gray-200 p-4 rounded mt-4 ml-12">

                    <p className="font-semibold mb-1">
                      Phản Hồi Của Người Bán
                    </p>

                    <p className="text-sm text-gray-700">
                      {review.sellerReply.message}
                    </p>

                  </div>

                )}

              </div>

            </div>

          </div>

        );
      })}

      {hasMore && reviews.length > 0 && (
        <div className="text-center mt-6">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="border px-4 py-2 rounded hover:bg-gray-100"
          >
            {loading ? "Đang tải..." : "Xem thêm bình luận"}
          </button>
        </div>
      )}

    </div>
  );
};

export default ReviewList;