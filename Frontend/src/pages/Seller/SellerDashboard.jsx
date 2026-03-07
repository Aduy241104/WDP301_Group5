import React, { useEffect, useState } from "react";
import { getDashboardStatsAPI } from "../../services/sellerOrder.service";
import { useAuth } from "../../context/AuthContext";
import {
  getDashboardStatTopProductAPI,
  getProductQuantityAPI,
} from "../../services/sellerDashboardService";
import NotificationPanel from "../../components/notification/NotificationPanel";

const EMPTY_STATS = {
  todayRevenue: 0,
  dayChangePercent: 0,
  monthRevenue: 0,
  monthChangePercent: 0,
  newOrdersToday: 0,
  pendingOrders: 0,
  orderStats: [],
  dailyRevenueLast7Days: [],
  monthlyRevenueLast12Months: [],
};

function SellerDashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState(EMPTY_STATS);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasShop] = useState(true);
  const [topProducts, setTopProducts] = useState([]);
  useEffect(() => {
    if (!user) return;
    fetchStats();
  }, [user?._id]);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // API stats cũ
      const data = await getDashboardStatsAPI();
      setStats(data);

      // API tổng sản phẩm
      const productData = await getProductQuantityAPI();
      setTotalProducts(productData.totalProducts);

      // gọi API top product để tránh ESLint unused
      const topProductsData = await getDashboardStatTopProductAPI();
      setTopProducts(topProductsData);
    } catch (err) {
      console.error("Failed to load dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Tổng quan</h2>

        {!hasShop && (
          <div className="mb-6 p-4 rounded-lg bg-yellow-50 text-yellow-700 border border-yellow-200">
            Shop chưa được thiết lập. Dữ liệu hiện không khả dụng.
          </div>
        )}

        {loading && (
          <div className="text-center py-6 text-gray-500">
            Đang tải dữ liệu...
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Doanh thu hôm nay"
            value={`${(stats.todayRevenue / 1_000_000).toFixed(1)}M ₫`}
            percent={stats.dayChangePercent}
          />

          <StatCard
            title="Doanh thu tháng này"
            value={`${(stats.monthRevenue / 1_000_000).toFixed(1)}M ₫`}
            percent={stats.monthChangePercent}
          />

          <SimpleCard title="Đơn hàng mới" value={stats.newOrdersToday} />

          <SimpleCard title="Đơn đang chờ xử lý" value={stats.pendingOrders} />

          <SimpleCard title="Tổng sản phẩm" value={totalProducts} />
        </div>
        {/* Top Selling Products */}
        <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
          <h3 className="text-lg font-semibold mb-4">Top Selling Products</h3>

          {topProducts?.length === 0 ? (
            <Empty />
          ) : (
            topProducts?.map((p) => (
              <div
                key={p._id}
                className="flex justify-between py-2 border-b last:border-b-0"
              >
                <span>{p.name}</span>
                <span className="font-bold">{p.totalSale} sold</span>
              </div>
            ))
          )}
        </div>
        {/* Order stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">
              Đơn hàng theo trạng thái
            </h3>

            {stats.orderStats.length === 0 ? (
              <Empty />
            ) : (
              stats.orderStats.map((s) => (
                <div
                  key={s._id}
                  className="flex justify-between py-2 border-b last:border-b-0"
                >
                  <span className="capitalize">{s._id}</span>
                  <span className="font-bold">{s.count}</span>
                </div>
              ))
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Doanh thu theo ngày</h3>

            {stats.dailyRevenueLast7Days.length === 0 ? (
              <Empty />
            ) : (
              stats.dailyRevenueLast7Days.map((d) => (
                <div key={d.date} className="flex items-center gap-4 mb-2">
                  <div className="w-32 text-sm">{d.date}</div>
                  <div className="flex-1 h-4 bg-gray-200 rounded">
                    <div
                      className="h-4 bg-blue-500"
                      style={{
                        width: `${Math.min(
                          100,
                          (d.total / (stats.todayRevenue || 1)) * 100,
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="w-28 text-right font-semibold">
                    {d.total.toLocaleString()}đ
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Monthly */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">
            Doanh thu theo tháng (12 tháng)
          </h3>

          {stats.monthlyRevenueLast12Months.length === 0 ? (
            <Empty />
          ) : (
            stats.monthlyRevenueLast12Months.map((m) => (
              <div key={m.month} className="flex items-center gap-4 mb-2">
                <div className="w-36 text-sm">{m.month}</div>
                <div className="flex-1 h-4 bg-gray-200 rounded">
                  <div
                    className="h-4 bg-green-500"
                    style={{
                      width: `${Math.min(
                        100,
                        (m.total / (stats.monthRevenue || 1)) * 100,
                      )}%`,
                    }}
                  />
                </div>
                <div className="w-28 text-right font-semibold">
                  {m.total.toLocaleString()}đ
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

/* ---------- Components ---------- */

const Empty = () => (
  <div className="text-gray-400 italic">Không có dữ liệu</div>
);

const SimpleCard = ({ title, value }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-2xl font-bold text-blue-700 mt-1">{value}</p>
  </div>
);

const StatCard = ({ title, value, percent }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-2xl font-bold text-blue-700 mt-1">{value}</p>
    <p
      className={`text-sm mt-2 ${
        percent >= 0 ? "text-green-600" : "text-red-600"
      }`}
    >
      {percent >= 0 ? "+" : ""}
      {percent}% so với kỳ trước
    </p>
  </div>
);

export default SellerDashboard;
