import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getShopDetail, getShopProducts, getShopCategoriesAPI, getShopProductsByCategory, } from "../services/shopService";
import ShopProductCard from "../components/shop/ShopProductCard";

export default function ShopDetailPage() {
  const { shopId } = useParams();

  const [shop, setShop] = useState(null);
  const [loadingShop, setLoadingShop] = useState(true);

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");


  // ================= FETCH SHOP =================
  const fetchShop = async () => {
    try {
      setLoadingShop(true);
      const data = await getShopDetail(shopId);
      console.log("SHOP DETAIL:", data);
      setShop(data.shop);
    } catch (err) {
      console.error("Fetch shop detail error:", err);
    } finally {
      setLoadingShop(false);
    }
  };

  // ================= FETCH PRODUCTS =================
  const fetchProducts = async (categoryId = "all") => {
    try {
      setLoadingProducts(true);

      let data;

      if (categoryId === "all") {
        data = await getShopProducts(shopId);
      } else {
        data = await getShopProductsByCategory(shopId, categoryId);
      }

      console.log("Products =", data);

      setProducts(data.products || []);
    } catch (err) {
      console.error(err);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };



  const fetchCategories = async () => {
    try {
      const data = await getShopCategoriesAPI(shopId);

      console.log("API categories =", data);

      setCategories(data.categories || []);
    } catch (err) {
      console.error(err);
      setCategories([]);
    }
  };



  useEffect(() => {
    if (shopId) {
      fetchShop();
      fetchCategories();
      fetchProducts("all");
    }
  }, [shopId]);

  if (loadingShop) return <div style={{ padding: 20 }}>Loading shop...</div>;
  if (!shop) return <div style={{ padding: 20 }}>Shop not found</div>;

  return (
    <div style={{ padding: 20, maxWidth: 1100, margin: "0 auto" }}>
      {/* ================= SHOP INFO ================= */}
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 12,
          padding: 20,
          display: "flex",
          gap: 20,
          alignItems: "center",
        }}
      >
        <img
          src={shop.avatar || "/no-avatar.png"}
          alt={shop.name}
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            objectFit: "cover",
            border: "2px solid #000",
          }}
        />

        <div>
          <h2 style={{ margin: 0 }}>{shop.name}</h2>
          <p style={{ margin: "6px 0" }}>{shop.description}</p>

          {shop.shopAddress && (
            <div style={{ fontSize: 14, color: "#555" }}>
              {shop.shopAddress.fullAddress}
            </div>
          )}
        </div>
      </div>

      {/* ================= CATEGORY FILTER ================= */}
      <div className="category-filter">
        <button
          className="filter-btn"
          onClick={() => fetchProducts("all")}
        >
          Tất cả
        </button>

        {categories.map((c) => (
          <button
            key={c._id}
            className="filter-btn"
            onClick={() => fetchProducts(c._id)}
          >
            {c.name}
          </button>
        ))}
      </div>


      {/* ================= PRODUCT LIST ================= */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-3">Sản phẩm của shop</h2>

        {loadingProducts ? (
          <div>Loading products...</div>
        ) : products.length === 0 ? (
          <div>Shop chưa có sản phẩm</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {products.map((product) => (
              <ShopProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
