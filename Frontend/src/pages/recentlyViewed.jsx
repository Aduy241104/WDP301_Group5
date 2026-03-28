import { useEffect, useState } from "react";
import {
  getRecentlyViewed,
  removeRecentlyViewed,
  clearRecentlyViewed
} from "../utils/recentlyViewed";
import { getProductsByIdsAPI } from "../services/productDiscoveryService";
import ProductCard from "../components/product/ProductCard";

function RecentlyViewedPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const ids = getRecentlyViewed();

      if (!ids.length) {
        setProducts([]);
        return;
      }

      const res = await getProductsByIdsAPI(ids);
      setProducts(res.items || []);
    } catch (error) {
      console.log("ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ xóa 1 sản phẩm
  const handleRemove = (id) => {
    removeRecentlyViewed(id);
    fetchData(); // reload lại
  };

  // ✅ clear tất cả
  const handleClearAll = () => {
    clearRecentlyViewed();
    setProducts([]);
  };

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (products.length === 0) {
    return (
      <div className="p-6 text-center">
        Bạn chưa xem sản phẩm nào
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          Sản phẩm đã xem gần đây
        </h2>

        {/* ✅ clear all */}
        <button
          onClick={handleClearAll}
          className="text-sm text-red-500 hover:underline"
        >
          Xóa tất cả
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((item) => (
          <div key={item._id} className="relative">
            
            {/* ✅ nút xóa */}
            <button
              onClick={() => handleRemove(item._id)}
              className="absolute top-2 right-2 bg-white border rounded-full w-6 h-6 text-xs hover:bg-red-500 hover:text-white z-10"
            >
              ✕
            </button>

            <ProductCard product={item} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentlyViewedPage;