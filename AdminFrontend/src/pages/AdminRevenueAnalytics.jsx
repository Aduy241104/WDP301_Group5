import React, { useEffect, useState } from "react";
import {
  fetchGMVStatistics,
  fetchRevenueByShop,
  fetchRevenueByCategory,
} from "../services/adminRevenueServices";

function StatCard({ title, value, subtext, icon }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">{value}</p>
          {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
        </div>
        {icon && <div className="text-3xl text-slate-300">{icon}</div>}
      </div>
    </div>
  );
}

export default function AdminRevenueAnalytics() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [gmvData, setGmvData] = useState(null);
  const [revenueByShop, setRevenueByShop] = useState(null);
  const [revenueByCategory, setRevenueByCategory] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const gmvResponse = await fetchGMVStatistics();
      setGmvData(gmvResponse);

      const shopResponse = await fetchRevenueByShop();
      setRevenueByShop(shopResponse);

      const categoryResponse = await fetchRevenueByCategory();
      setRevenueByCategory(categoryResponse);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể tải dữ liệu thống kê."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Revenue Analytics</h1>
        <p className="text-slate-500 mt-1">
          Xem thống kê doanh thu, GMV và hiệu suất bán hàng
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* GMV Stat Cards */}

      {gmvData?.totals && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          <StatCard
            title="Total GMV"
            value={formatCurrency(gmvData?.totals?.totalGMV)}
            subtext={`${gmvData?.totals?.totalOrders || 0} đơn hàng`}
            icon="💰"
          />

          <StatCard
            title="Average Order Value"
            value={formatCurrency(gmvData?.totals?.averageOrderValue)}
            subtext="Giá trị trung bình"
            icon="📊"
          />

          <StatCard
            title="Total Orders"
            value={gmvData?.totals?.totalOrders || 0}
            subtext={`GMV: ${formatCurrency(gmvData?.totals?.totalGMV)}`}
            icon="📦"
          />

        </div>
      )}

      {/* Revenue by Shop */}

      {revenueByShop?.items && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Revenue by Shop</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left">Shop</th>
                  <th className="px-4 py-3 text-right">Revenue</th>
                  <th className="px-4 py-3 text-right">Orders</th>
                  <th className="px-4 py-3 text-right">Avg Order</th>
                </tr>
              </thead>

              <tbody>
                {revenueByShop?.items?.map((shop, idx) => (
                  <tr key={idx} className="border-b hover:bg-slate-50">
                    <td className="px-4 py-3">{shop.shopName || "Unknown"}</td>

                    <td className="px-4 py-3 text-right font-medium">
                      {formatCurrency(shop.totalRevenue)}
                    </td>

                    <td className="px-4 py-3 text-right">
                      {shop.orderCount || 0}
                    </td>

                    <td className="px-4 py-3 text-right">
                      {formatCurrency(shop.averageOrderValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Revenue by Category */}

      {revenueByCategory?.items && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">
            Revenue by Category
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-right">Revenue</th>
                  <th className="px-4 py-3 text-right">Orders</th>
                  <th className="px-4 py-3 text-right">Avg Order</th>
                </tr>
              </thead>

              <tbody>
                {revenueByCategory?.items?.map((cat, idx) => (
                  <tr key={idx} className="border-b hover:bg-slate-50">
                    <td className="px-4 py-3">
                      {cat.categoryName || "Unknown"}
                    </td>

                    <td className="px-4 py-3 text-right font-medium">
                      {formatCurrency(cat.totalRevenue)}
                    </td>

                    <td className="px-4 py-3 text-right">
                      {cat.orderCount || 0}
                    </td>

                    <td className="px-4 py-3 text-right">
                      {formatCurrency(cat.averageOrderValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Loading */}

      {loading && (
        <div className="text-center py-12">
          <div className="h-8 w-8 border-4 border-slate-300 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600 mt-3">Đang tải dữ liệu...</p>
        </div>
      )}
    </div>
  );
}