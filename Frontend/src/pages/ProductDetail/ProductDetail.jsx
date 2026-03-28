// pages/ProductDetail.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductDetailAPI } from "../../services/productDiscoveryService";
import { useNavigate } from "react-router-dom";
import ProductInfo from "./ProductInfo";
import AddToCartSection from "./AddToCartSection";
import ProductFeedbackSection from "./ProductFeedbackSection";
import { useAuth } from "../../context/AuthContext";
import { userTrackingAPI } from "../../services/userTrackingService";
import SimilarShopList from "./SimilarShopList";
import { checkReportedAPI } from "../../services/reportService";

export default function ProductDetail() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState(0);
  const { isAuthenticated } = useAuth();
  const [isReported, setIsReported] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const data = await getProductDetailAPI(productId);
        setProduct(data.item);
        setCurrentPrice(data?.item?.variants?.[0]?.price ?? 0);
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  useEffect(() => {
    if (isAuthenticated) {
      const handleTrackingUserEvent = async () => {
        try {
          console.log("HÊLLOLOEO");

          const response = await userTrackingAPI(productId, "view_detail");
        } catch (error) {
          console.log("ERROR WHEN TRACKING USER EVENT: ", error.message);
        }
      };

      handleTrackingUserEvent();
    }
  }, [productId]);
  const handleReportProduct = () => {
    navigate(`/report/product/${product._id}`);
  };
  useEffect(() => {
    if (!product) return;

    const check = async () => {
      try {
        const res = await checkReportedAPI({
          targetType: "product",
          targetId: product._id,
        });

        setIsReported(res.reported);
      } catch (err) {
        console.log("Check report error:", err);
      }
    };

    check();
  }, [product]);

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (!product) {
    return (
      <div className="p-6 text-center text-red-500">Product not found</div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-2 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product info */}
          <div className="lg:col-span-2">
            <ProductInfo currentPrice={currentPrice} product={product} />
            <button
              onClick={handleReportProduct}
              disabled={isReported}
              className={`mt-4 px-4 py-2 rounded-lg text-white ${
                isReported
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600"
              }`}
            >
              {isReported ? "✅ Đã báo cáo" : "🚨 Báo cáo sản phẩm"}
            </button>
          </div>

          {/* Add to cart */}
          <div>
            <AddToCartSection
              setCurrentPrice={setCurrentPrice}
              product={product}
            />
            <div className="bg-white rounded-xl p-4 shadow">
              <h3 className="font-semibold mb-3">Shop bán tương tự</h3>
              <SimilarShopList productId={productId} />
            </div>
          </div>
        </div>

        {/* Feedback */}
        <ProductFeedbackSection productId={product._id} />
      </div>
    </div>
  );
}
