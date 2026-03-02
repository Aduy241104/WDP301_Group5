import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getShopDetail, getShopProducts, getShopCategoriesAPI, getShopProductsByCategory, } from "../services/shopService";
import ShopProductCard from "../components/shop/ShopProductCard";
import "../App.css";

export default function ShopDetailPage() {
  const { shopId } = useParams();

  const [shop, setShop] = useState(null);
  const [loadingShop, setLoadingShop] = useState(true);

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState(null);



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
  const fetchProducts = async (categoryId = "all", currentPage = 1) => {
    try {
      setLoadingProducts(true);
      setPage(currentPage);

      let data;

      if (categoryId === "all") {
        data = await getShopProducts(shopId, {
          page: currentPage,
          limit,
        });
      } else {
        data = await getShopProductsByCategory(shopId, categoryId, {
          page: currentPage,
          limit,
        });
      }

      setProducts(data.products || []);
      setPagination(data.pagination);
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

  const handleFilter = (id) => {
    setActiveCategory(id);
    fetchProducts(id);
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
          className={`filter-btn ${activeCategory === "all" ? "active" : ""}`}
          onClick={() => handleFilter("all")}
        >
          Tất cả
        </button>

        {categories.slice(0, 4).map((c) => (
          <button
            key={c._id}
            className={`filter-btn ${activeCategory === c._id ? "active" : ""}`}
            onClick={() => handleFilter(c._id)}
          >
            {c.name}
          </button>
        ))}

        {categories.length > 4 && (
          <div className="filter-btn more">
            Thêm ▾
            <div className="dropdown">
              {categories.slice(4).map((c) => (
                <div
                  key={c._id}
                  className={`dropdown-item ${activeCategory === c._id ? "active" : ""}`}
                  onClick={() => handleFilter(c._id)}
                >
                  {c.name}
                </div>
              ))}
            </div>
          </div>
        )}
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

      {pagination && pagination.totalPages > 1 && (
        <div
          style={{
            marginTop: 30,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: 10,
              background: "#fff",
            }}
          >
            {/* Nút Prev */}
            <button
              disabled={page === 1}
              onClick={() => fetchProducts(activeCategory, page - 1)}
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                border: "1px solid #ccc",
                background: page === 1 ? "#f5f5f5" : "#fff",
                cursor: page === 1 ? "not-allowed" : "pointer",
              }}
            >
              {"<"}
            </button>

            {/* Số trang */}
            {Array.from({ length: pagination.totalPages }, (_, index) => {
              const pageNumber = index + 1;

              return (
                <button
                  key={pageNumber}
                  onClick={() =>
                    fetchProducts(activeCategory, pageNumber)
                  }
                  style={{
                    padding: "6px 10px",
                    borderRadius: 6,
                    border:
                      page === pageNumber
                        ? "1px solid #000"
                        : "1px solid #ccc",
                    background:
                      page === pageNumber ? "#77E2F2" : "#fff",
                    color:
                      page === pageNumber ? "#000" : "#000",
                    fontWeight:
                      page === pageNumber ? "700" : "normal",
                    cursor: "pointer",
                  }}
                >
                  {pageNumber}
                </button>
              );
            })}

            {/* Nút Next */}
            <button
              disabled={page === pagination.totalPages}
              onClick={() => fetchProducts(activeCategory, page + 1)}
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                border: "1px solid #ccc",
                background:
                  page === pagination.totalPages
                    ? "#f5f5f5"
                    : "#fff",
                cursor:
                  page === pagination.totalPages
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {">"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
