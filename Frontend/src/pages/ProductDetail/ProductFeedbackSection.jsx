import { useState } from "react";
import ReviewForm from "../../components/review/ReviewForm";
import ReviewList from "../../components/review/ReviewList";

export default function ProductFeedbackSection({ productId }) {

  const [reload, setReload] = useState(false);

  const reloadReviews = () => {
    setReload(!reload);
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">

      <h2 className="text-xl font-semibold mb-6">
        Đánh giá sản phẩm
      </h2>

      {/* Form review */}
      {/* <ReviewForm
        productId={productId}
        reloadReviews={reloadReviews}
      /> */}

      {/* List review */}
      <ReviewList
        productId={productId}
        reload={reload}
      />

    </div>
  );
}