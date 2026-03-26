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