import { useState } from "react";
import { addReviewAPI } from "../../services/reviewUserService";
import StarRating from "./StarRating";

const ReviewForm = ({ productId, orderId, reloadReviews }) => {

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();


    try {

      setError("");
      setSuccess("");

      await addReviewAPI({
        productId,
        orderId,
        rating,
        comment: comment.trim()
      });

      setSuccess("Đánh giá sản phẩm thành công 🎉");

      setComment("");
      setRating(5);


    } catch (err) {

      const message = err?.response?.data?.message;

      console.log("Review error:", message);

      if (message === "You already reviewed this product in this order") {
        setError("Bạn đã đánh giá sản phẩm này rồi");
      }
      else if (message === "Product not found in this order") {
        setError("Sản phẩm không tồn tại trong đơn hàng");
      }
      else if (message === "Order not found or not delivered") {
        setError("Đơn hàng chưa giao nên chưa thể đánh giá");
      }
      else {
        setError(message || "Không thể gửi đánh giá");
      }
    }
  };

  return (

    <form
      onSubmit={handleSubmit}
      className="border p-4 rounded bg-white"
    >

      <h3 className="font-semibold mb-3">
        Đánh giá sản phẩm
      </h3>

      {/* SUCCESS MESSAGE */}
      {success && (
        <div className="bg-green-100 text-green-700 border border-green-300 p-2 rounded mb-3 text-sm">
          {success}
        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div className="bg-red-100 text-red-700 border border-red-300 p-2 rounded mb-3 text-sm">
          {error}
        </div>
      )}

      {/* STAR */}
      <StarRating
        value={rating}
        onChange={setRating}
      />

      {/* COMMENT */}
      <textarea
        className="border w-full p-2 mt-3 rounded"
        placeholder="Viết đánh giá của bạn..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <button
        className="bg-[#77E2F2] text-white px-4 py-2 rounded mt-3 hover:opacity-90"
      >
        Gửi đánh giá
      </button>

    </form>

  );
};

export default ReviewForm;