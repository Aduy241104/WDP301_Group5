import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSimilarShops } from "../services/shopService.js";

export default function ShopListPage() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const data = await getSimilarShops(productId);
      setShops(data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) fetchShops();
  }, [productId]);

  if (loading) return <div style={{ padding: 20 }}>Loading shops...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Danh sách Shop bán sản phẩm tương tự</h2>

      <div style={{ display: "grid", gap: 16 }}>
        {shops.map((shop) => (
          <div
            key={shop.shopId}
            onClick={() => navigate(`/shop/${shop.shopId}`)}
            style={{
              border: "1px solid #ddd",
              borderRadius: 12,
              padding: 16,
              display: "flex",
              gap: 16,
              alignItems: "flex-start",
              background: "#fff",
            }}
          >
            {/* Avatar shop */}
            <img
              src={shop.shopAvatar || "/no-avatar.png"}
              alt={shop.shopName}
              style={{
                width: 85,
                height: 90,
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid #000",
              }}
            />

            {/* Info */}
            <div style={{ flex: 1 }}>

              {/* Product */}
              <div style={{ fontWeight: 500 }}>{shop.productName}</div>

              <h4 style={{ margin: "0 0 6px 0" }}>{shop.shopName}</h4>

              <div style={{ marginTop: 4 }}>
                {shop.price?.toLocaleString()} ₫
              </div>

              <div style={{ marginTop: 4, fontSize: 14 }}>
                ⭐ {shop.rating ?? 0} | Đã bán online: {shop.totalSale ?? 0}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
