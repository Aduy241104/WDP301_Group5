import { useEffect, useState } from "react";
import { getWishlistAPI } from "../services/wishlistUserService";
import ProductCard from "../components/product/ProductCard";

const LIMIT = 10;

export default function WishlistPage() {

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);

  const loadWishlist = async () => {
    try {

      const res = await getWishlistAPI();

      setWishlist(res.data || []);

    } catch (err) {
      console.error("Wishlist error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  // pagination logic
  const start = (page - 1) * LIMIT;
  const end = start + LIMIT;

  const currentProducts = wishlist.slice(start, end);

  const totalPages = Math.ceil(wishlist.length / LIMIT);

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500">
        Đang tải wishlist...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">

      <h2 className="text-2xl font-semibold mb-6">
        Sản phẩm yêu thích
      </h2>

      {wishlist.length === 0 && (
        <div className="text-gray-400">
          Bạn chưa có sản phẩm yêu thích
        </div>
      )}

      {/* PRODUCT GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">

        {currentProducts.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
          />
        ))}

      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">

          {[...Array(totalPages)].map((_, i) => (

            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 border rounded
              ${page === i + 1
                  ? "bg-[#77E2F2] text-white border-[#77E2F2]"
                  : "hover:bg-gray-100"}
            `}
            >
              {i + 1}
            </button>

          ))}

        </div>
      )}

    </div>
  );
}