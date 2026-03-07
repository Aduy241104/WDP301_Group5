import { useEffect, useState } from "react";
import { fetchMonthlyUserRegistrations } from "../services/AdminUserAnalyticsServices.js";

export default function UserAnalytics() {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchMonthlyUserRegistrations();
      setData(res.data || []);
    } catch (err) {
      console.error("Load user analytics error:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalUsers = data.reduce((sum, item) => sum + item.totalUsers, 0);

  // format month + year từ API
  const formatMonthYear = (month, year) => {
    const monthStr = String(month).padStart(2, "0");
    return `${monthStr}/${year}`;
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">User Analytics</h2>
        <p className="text-sm text-slate-500">
          Thống kê số lượng người dùng đăng ký theo tháng
        </p>
      </div>

      {/* Total Card */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <p className="text-sm text-slate-500">Total Registrations</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{totalUsers}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">

        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">
            Monthly User Registrations
          </h3>
        </div>

        {loading ? (
          <div className="text-center py-10 text-slate-500">
            Loading data...
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            No data available
          </div>
        ) : (
          <table className="w-full text-sm">

            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">
                  Period
                </th>
                <th className="px-6 py-3 text-right font-semibold text-slate-700">
                  Users Registered
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {data.map((item, index) => (
                <tr key={index} className="hover:bg-slate-50">

                  <td className="px-6 py-3 text-slate-900">
                    {formatMonthYear(item.month, item.year)}
                  </td>

                  <td className="px-6 py-3 text-right font-semibold text-blue-600">
                    {item.totalUsers}
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        )}

      </div>

    </div>
  );
}