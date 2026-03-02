import React, { useCallback, useEffect, useState } from "react";
import reviewService from "../../services/review.service";

export default function SellerReviews() {
  const [groups, setGroups] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [replyMap, setReplyMap] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      const data = await reviewService.getReviewsAPI();
      setGroups(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReviews = useCallback(async (productId) => {
    try {
      setLoading(true);
      const data = await reviewService.getReviewsAPI({ productId });
      setReviews(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const openProduct = (productId) => {
    setSelectedProduct(productId);
    fetchReviews(productId);
  };

  const handleReplyChange = (reviewId, value) => {
    setReplyMap((prev) => ({ ...prev, [reviewId]: value }));
  };

  const handleReply = async (reviewId) => {
    try {
      const message = replyMap[reviewId];
      if (!message) return;

      await reviewService.replyReviewAPI(reviewId, { message });

      setReplyMap((prev) => {
        const clone = { ...prev };
        delete clone[reviewId];
        return clone;
      });

      if (selectedProduct) fetchReviews(selectedProduct);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-semibold mb-6">Customer Reviews</h2>

      <div className="grid grid-cols-12 gap-6">
        {/* LEFT – PRODUCT LIST */}
        <div className="col-span-4 space-y-4">
          <h3 className="font-medium text-gray-700">Products</h3>

          {groups.map((g, index) => {
            const avg =
              g.avgRating !== null && g.avgRating !== undefined
                ? Number(g.avgRating).toFixed(1)
                : "0.0";

            return (
              <div
                key={`${g.productId}-${index}`}
                className={`p-4 rounded-xl border bg-white shadow-sm hover:shadow-md transition cursor-pointer ${
                  selectedProduct === g.productId ? "border-indigo-500" : ""
                }`}
                onClick={() => openProduct(g.productId)}
              >
                <div className="font-medium text-gray-900">
                  {g.productName || "Unnamed product"}
                </div>

                <div className="mt-1 text-sm text-gray-500 flex items-center gap-2">
                  <span>{g.count || 0} reviews</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">⭐ {avg}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT – REVIEWS */}
        <div className="col-span-8">
          {!selectedProduct && (
            <div className="bg-white p-10 rounded-xl border text-gray-400 text-center">
              Select a product to view its reviews
            </div>
          )}

          {selectedProduct && (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div
                  key={r._id}
                  className="bg-white rounded-xl border shadow-sm p-5"
                >
                  {/* USER INFO */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center font-semibold text-indigo-600">
                        {r.userId?.name?.[0] || "U"}
                      </div>

                      <div>
                        <div className="font-medium text-gray-900">
                          {r.userId?.name || "Customer"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="text-sm font-semibold text-yellow-500">
                      {"★".repeat(r.rating)}
                    </div>
                  </div>

                  {/* COMMENT */}
                  <div className="mt-3 text-gray-700">{r.comment}</div>

                  {/* SELLER REPLY */}
                  <div className="mt-4">
                    {r.sellerReply ? (
                      <div className="bg-gray-50 border rounded-lg p-3 text-sm">
                        <div className="font-medium text-gray-700 mb-1">
                          Seller reply
                        </div>
                        <div className="text-gray-600">
                          {r.sellerReply.message}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <textarea
                          className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                          placeholder="Reply to customer..."
                          rows={3}
                          value={replyMap[r._id] || ""}
                          onChange={(e) =>
                            handleReplyChange(r._id, e.target.value)
                          }
                        />
                        <div className="flex justify-end mt-2">
                          <button
                            className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
                            onClick={() => handleReply(r._id)}
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
