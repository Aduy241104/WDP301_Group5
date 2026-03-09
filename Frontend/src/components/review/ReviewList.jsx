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

  const [openMenuId, setOpenMenuId] = useState(null);

  const loadReviews = async () => {
    const data = await getProductReviewsAPI(productId, {
      page: 1,
      rating: ratingFilter,
    });

    setReviews(data.data.reviews || []);
  };

  useEffect(() => {
    loadReviews();
  }, [reload, ratingFilter]);


  const handleDelete = async (reviewId) => {
    await deleteReviewAPI(reviewId);
    loadReviews();
  };

  const handleUpdate = async () => {

    await updateReviewAPI(editingReview._id, {
      rating: editRating,
      comment: editComment
    });

    setEditingReview(null);
    loadReviews();
  };


  return (
    <div>

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

        const isOwner = review.userId?._id === currentUserId;

        return (

          <div
            key={review._id}
            className="relative border-b py-6"
          >

            {/* ACTION BUTTON */}
            {isOwner && (
              <div className="absolute top-2 right-2">

                {/* THREE DOT BUTTON */}
                <button
                  onClick={() =>
                    setOpenMenuId(openMenuId === review._id ? null : review._id)
                  }
                  className="text-gray-500 text-xl px-2"
                >
                  ⋮
                </button>

                {/* DROPDOWN */}
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


            {/* USER INFO */}
            <div className="flex items-start gap-4">

              <img
                src={review.userId?.avatar || "/avatar.png"}
                className="w-12 h-12 rounded-full object-cover"
              />

              <div className="flex-1">

                <p className="font-semibold">
                  {review.userId?.fullName}
                </p>

                {/* STAR */}
                <div className="text-red-500 text-sm">
                  {"⭐".repeat(review.rating)}
                </div>

                {/* DATE */}
                {new Date(review.createdAt).toLocaleString("sv-SE", {
                  timeZone: "Asia/Ho_Chi_Minh",
                }).replace("T", " ").slice(0, 16)}

                {/* COMMENT */}
                <div className="mt-3 bg-gray-200 p-3 rounded-md">
                  <p className="text-gray-800">
                    {review.comment}
                  </p>
                </div>


                {/* SELLER REPLY */}
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



      {/* EDIT MODAL */}
      {editingReview && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white p-6 rounded-lg w-[400px]">

            <h3 className="font-semibold mb-4">
              Chỉnh sửa đánh giá
            </h3>

            {/* STAR */}
            <div className="flex gap-1 text-2xl mb-4">

              {[1, 2, 3, 4, 5].map(star => (

                <span
                  key={star}
                  onClick={() => setEditRating(star)}
                  className={`cursor-pointer ${editRating >= star
                    ? "text-yellow-500"
                    : "text-gray-300"
                    }`}
                >
                  ★
                </span>

              ))}

            </div>


            {/* COMMENT */}
            <textarea
              value={editComment}
              onChange={(e) => setEditComment(e.target.value)}
              className="border w-full p-2 rounded"
            />


            <div className="flex justify-end gap-3 mt-4">

              <button
                onClick={() => setEditingReview(null)}
                className="border px-4 py-2 rounded"
              >
                Hủy
              </button>

              <button
                onClick={handleUpdate}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Lưu
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default ReviewList;