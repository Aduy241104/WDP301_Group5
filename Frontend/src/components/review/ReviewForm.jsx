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
      onSubmit={ handleSubmit }
      className="max-w-xl bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-4"
    >
      {/* TITLE */ }
      <h3 className="text-lg font-semibold text-gray-800">
        Đánh giá sản phẩm
      </h3>

      {/* SUCCESS MESSAGE */ }
      { success && (
        <div className="bg-green-50 text-green-700 border border-green-200 px-3 py-2 rounded-lg text-sm">
          { success }
        </div>
      ) }

      {/* ERROR MESSAGE */ }
      { error && (
        <div className="bg-red-50 text-red-700 border border-red-200 px-3 py-2 rounded-lg text-sm">
          { error }
        </div>
      ) }

      {/* STAR */ }
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">Đánh giá:</span>
        <StarRating value={ rating } onChange={ setRating } />
      </div>

      {/* COMMENT */ }
      <div>
        <textarea
          className="w-full border border-gray-300 rounded-lg p-3 text-sm
      focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400
      transition resize-none"
          rows={ 4 }
          placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
          value={ comment }
          onChange={ (e) => setComment(e.target.value) }
        />
      </div>

      {/* BUTTON */ }
      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-cyan-500 hover:bg-cyan-600 text-white font-medium
      px-5 py-2.5 rounded-lg transition shadow-sm"
        >
          Gửi đánh giá
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;