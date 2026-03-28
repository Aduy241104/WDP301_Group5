import { useEffect, useMemo, useState } from "react";
import {
  getFollowerPurchaseConversionRate,
  getShopFollowers,
  getTopFollowersByNumberOfOrders,
} from "../../../services/followService";

export default function SellerFollowers() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [shopLimit, setShopLimit] = useState(10);
  const [topLimit, setTopLimit] = useState(10);

  const [followers, setFollowers] = useState([]);
  const [topFollowers, setTopFollowers] = useState([]);
  const [topMeta, setTopMeta] = useState(null);
  const [conversion, setConversion] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [followersRes, topRes, conversionRes] = await Promise.all([
        getShopFollowers(1, shopLimit),
        getTopFollowersByNumberOfOrders(topLimit),
        getFollowerPurchaseConversionRate(),
      ]);

      setFollowers(followersRes?.data?.items ?? []);

      const topData = topRes?.data ?? topRes;
      setTopMeta(topData ?? null);
      setTopFollowers(topData?.items ?? []);

      setConversion(conversionRes?.data ?? conversionRes ?? null);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shopLimit, topLimit]);

  const conversionRate = useMemo(
    () => Number(conversion?.conversionRate ?? 0),
    [conversion],
  );

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Followers</h2>
          <p className="text-sm text-slate-600 mt-1">
            Tổng hợp: Shop followers, Top followers và Conversion rate.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-slate-600 font-medium">
            Shop limit
          </div>
          <select
            value={shopLimit}
            onChange={(e) => setShopLimit(Number(e.target.value))}
            className="h-10 border border-slate-200 rounded-lg px-3 text-sm outline-none"
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 text-rose-700 border border-rose-100 p-4 text-sm">
          {error}
        </div>
      )}

      {/* Shop Followers */}
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 flex items-start justify-between gap-4 border-b border-gray-200">
          <div>
            <div className="text-lg font-semibold text-gray-900">
              Shop Followers
            </div>
            <div className="text-sm text-slate-600 mt-1">
              Hiển thị {shopLimit} followers mới nhất.
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="text-left p-3">Avatar</th>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Followed At</th>
              </tr>
            </thead>

            <tbody>
              {followers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-slate-500">
                    No followers found.
                  </td>
                </tr>
              ) : (
                followers.map((f) => (
                  <tr key={f.user?._id} className="border-b">
                    <td className="p-3">
                      <img
                        src={f.user?.avatar || "/default-avatar.png"}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    </td>
                    <td className="p-3">{f.user?.fullname || "—"}</td>
                    <td className="p-3">{f.user?.email || "—"}</td>
                    <td className="p-3">
                      {f.followedAt
                        ? new Date(f.followedAt).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top followers by orders */}
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 flex items-start justify-between gap-4 border-b border-gray-200">
          <div>
            <div className="text-lg font-semibold text-gray-900">
              Top followers (by Orders)
            </div>
            <div className="text-sm text-slate-600 mt-1">
              Top người theo dõi theo số đơn đã giao thành công.
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-600 font-medium">Limit</div>
            <select
              value={topLimit}
              onChange={(e) => setTopLimit(Number(e.target.value))}
              className="h-10 border border-slate-200 rounded-lg px-3 text-sm outline-none"
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="px-5 py-4">
          {topFollowers.length === 0 ? (
            <div className="py-10 text-center text-slate-500">
              No top followers found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="text-left p-3">Avatar</th>
                    <th className="text-left p-3">Name</th>
                    <th className="text-left p-3">Email</th>
                    <th className="text-right p-3">Order Count</th>
                  </tr>
                </thead>
                <tbody>
                  {topFollowers.map((row) => (
                    <tr key={row?.user?._id} className="border-b">
                      <td className="p-3">
                        <img
                          src={row?.user?.avatar || "/default-avatar.png"}
                          alt=""
                          className="w-9 h-9 rounded-full object-cover"
                        />
                      </td>
                      <td className="p-3">{row?.user?.fullname || "—"}</td>
                      <td className="p-3">{row?.user?.email || "—"}</td>
                      <td className="p-3 text-right font-semibold">
                        {row?.orderCount ?? 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Purchase conversion rate */}
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 flex items-start justify-between gap-4 border-b border-gray-200">
          <div>
            <div className="text-lg font-semibold text-gray-900">
              Follower Purchase Conversion Rate
            </div>
            <div className="text-sm text-slate-600 mt-1">
              Tỷ lệ follower có mua hàng (đã giao thành công) trên tổng
              số follower.
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm text-slate-600">Total followers</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {conversion?.totalFollowers ?? 0}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm text-slate-600">
                Purchased followers
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {conversion?.purchasedFollowersCount ?? 0}
              </div>
            </div>

            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
              <div className="text-sm text-indigo-700 font-medium">
                Conversion rate
              </div>
              <div className="text-2xl font-bold text-indigo-900 mt-1">
                {Number.isFinite(conversionRate) ? conversionRate : 0}%
              </div>
            </div>
          </div>
          {topMeta?.totalFollowers != null && (
            <div className="mt-4 text-xs text-slate-500">
              Gợi ý: Top followers dựa trên delivered orders, limit chọn ở
              bảng phía trên.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}