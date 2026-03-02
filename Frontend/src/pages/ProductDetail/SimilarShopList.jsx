import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSimilarShops } from "../../services/shopService";

export default function SimilarShopList({ productId }) {
  const navigate = useNavigate();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;

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

    fetchShops();
  }, [productId]);

  if (loading) return <div>Loading shops...</div>;
  if (!shops.length) return <div>Không có shop tương tự</div>;

  return (
    <div className="space-y-3">
      {shops.map((shop) => (
        <div
          key={shop.shopId}
          onClick={() => navigate(`/shop/${shop.shopId}`)}
          className="border rounded-xl p-3 flex gap-3 cursor-pointer hover:shadow"
        >
          <img
            src={shop.shopAvatar || "/no-avatar.png"}
            alt={shop.shopName}
            className="w-14 h-14 rounded-full object-cover border"
          />

          <div className="flex-1 text-sm">
            <div className="font-medium line-clamp-1">{shop.productName}</div>
            <div className="font-semibold">{shop.shopName}</div>

            <div className="text-red-500">
              {shop.price?.toLocaleString()} ₫
            </div>

            <div className="text-xs text-gray-500">
              ⭐ {shop.rating ?? 0} | Đã bán: {shop.totalSale ?? 0}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}