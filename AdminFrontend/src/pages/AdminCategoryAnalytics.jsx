import React, { useEffect, useState } from "react";
import { fetchRevenueByCategory } from "../services/adminRevenueServices";

export default function AdminCategoryAnalytics() {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {

      setLoading(true);
      setError("");

      const res = await fetchRevenueByCategory();

      setData(res?.statistics || []);

    } catch (err) {

      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Không thể tải dữ liệu category."
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
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Category Analytics
        </h1>

        <p className="text-slate-500 mt-1">
          Thống kê doanh thu theo danh mục sản phẩm
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Table */}
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
                <th className="px-4 py-3 text-right">Quantity Sold</th>
              </tr>
            </thead>

            <tbody>

              {data.map((cat, index) => (

                <tr
                  key={cat.categoryId || index}
                  className="border-b hover:bg-slate-50"
                >

                  <td className="px-4 py-3 font-medium">
                    {cat.categoryName}
                  </td>

                  <td className="px-4 py-3 text-right font-semibold text-green-600">
                    {formatCurrency(cat.totalRevenue)}
                  </td>

                  <td className="px-4 py-3 text-right">
                    {cat.totalOrders}
                  </td>

                  <td className="px-4 py-3 text-right">
                    {cat.totalQuantity}
                  </td>

                </tr>

              ))}

              {data.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan="4"
                    className="text-center py-6 text-slate-500"
                  >
                    Không có dữ liệu
                  </td>
                </tr>
              )}

            </tbody>

          </table>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-10">

          <div className="h-8 w-8 border-4 border-slate-300 border-t-blue-600 rounded-full animate-spin mx-auto"></div>

          <p className="text-slate-500 mt-3">
            Đang tải dữ liệu...
          </p>

        </div>
      )}

    </div>
  );
}