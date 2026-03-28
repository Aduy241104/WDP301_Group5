import { useEffect, useMemo, useState } from "react";
import {
  getFollowerPurchaseConversionRate,
  getShopFollowers,
  getTopFollowersByNumberOfOrders,
  getFollowerDetailAPI
} from "../../../services/followService";

export default function SellerFollowers() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [shopLimit, setShopLimit] = useState(10);
  const [topLimit, setTopLimit] = useState(10);

  const [followers, setFollowers] = useState([]);
  const [topFollowers, setTopFollowers] = useState([]);
  const [conversion, setConversion] = useState(null);

  const [selectedFollower, setSelectedFollower] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

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
      setTopFollowers(topRes?.data?.items ?? []);
      setConversion(conversionRes?.data ?? null);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (userId) => {
    try {
      setLoadingDetail(true);
      const res = await getFollowerDetailAPI(userId);
      setSelectedFollower(res.data.data);
    } catch (err) {
      alert("Failed to load detail");
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [shopLimit, topLimit]);

  const conversionRate = useMemo(
    () => Number(conversion?.conversionRate ?? 0),
    [conversion],
  );

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Followers</h2>
          <p className="text-sm text-gray-500">
            Tổng hợp followers, top buyers và tỷ lệ chuyển đổi
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm">Shop limit</span>
          <select
            value={shopLimit}
            onChange={(e) => setShopLimit(Number(e.target.value))}
            className="border px-3 py-1 rounded-lg"
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="text-red-500">{error}</div>}

      {/* SHOP FOLLOWERS */}
      <div className="bg-white rounded-2xl shadow border overflow-hidden">
        <div className="p-4 font-semibold text-gray-700 border-b">
          Shop Followers
        </div>

        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Followed</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {followers.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-6">
                  No followers
                </td>
              </tr>
            ) : (
              followers.map((f) => (
                <tr key={f.user?._id} className="border-b hover:bg-gray-50">

                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={f.user?.avatar || "/default-avatar.png"}
                        className="w-10 h-10 rounded-full border object-cover"
                      />
                      <div>
                        <div className="font-medium text-gray-800">
                          {f.user?.fullname || f.user?.fullName || "No name"}
                        </div>
                        <div className="text-xs text-gray-400">
                          ID: {f.user?._id?.slice(-6)}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="p-3 text-gray-600">
                    {f.user?.email}
                  </td>

                  <td className="p-3 text-gray-500">
                    {new Date(f.followedAt).toLocaleDateString()}
                  </td>

                  <td className="p-3">
                    <button
                      onClick={() => handleView(f.user?._id)}
                      className="px-3 py-1.5 text-xs bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"
                    >
                      View
                    </button>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* TOP FOLLOWERS */}
      <div className="bg-white rounded-2xl shadow border overflow-hidden">
        <div className="p-4 flex justify-between items-center border-b">
          <span className="font-semibold text-gray-700">
            Top followers (by Orders)
          </span>

          <select
            value={topLimit}
            onChange={(e) => setTopLimit(Number(e.target.value))}
            className="border px-3 py-1 rounded-lg"
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-right">Orders</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {topFollowers.map((row) => (
              <tr key={row.user?._id} className="border-b hover:bg-gray-50">

                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={row.user?.avatar || "/default-avatar.png"}
                      className="w-10 h-10 rounded-full border"
                    />
                    <div>
                      <div className="font-medium text-gray-800">
                        {row.user?.fullname || row.user?.fullName || "No name"}
                      </div>
                      <div className="text-xs text-gray-400">
                        ID: {row.user?._id?.slice(-6)}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="p-3 text-gray-600">
                  {row.user?.email}
                </td>

                <td className="p-3 text-right font-semibold text-indigo-600">
                  {row.orderCount}
                </td>

                <td className="p-3">
                  <button
                    onClick={() => handleView(row.user?._id)}
                    className="px-3 py-1.5 text-xs bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"
                  >
                    View
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CONVERSION */}
      <div className="bg-white p-5 rounded-2xl shadow border grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-gray-400 text-sm">Total Followers</div>
          <div className="text-xl font-bold text-gray-800">
            {conversion?.totalFollowers || 0}
          </div>
        </div>

        <div>
          <div className="text-gray-400 text-sm">Purchased</div>
          <div className="text-xl font-bold text-green-600">
            {conversion?.purchasedFollowersCount || 0}
          </div>
        </div>

        <div>
          <div className="text-gray-400 text-sm">Conversion</div>
          <div className="text-xl font-bold text-indigo-600">
            {conversionRate}%
          </div>
        </div>
      </div>

      {/* MODAL */}
      {selectedFollower && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-[420px] shadow-xl">

            {loadingDetail ? (
              <div>Loading...</div>
            ) : (
              <>
                <div className="flex gap-4 mb-4">
                  <img
                    src={selectedFollower.user?.avatar || "/default-avatar.png"}
                    className="w-14 h-14 rounded-full border"
                  />
                  <div>
                    <div className="text-lg font-semibold">
                      {selectedFollower.user?.fullName || selectedFollower.user?.fullName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {selectedFollower.user?.email}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-gray-400">Total Orders</div>
                    <div className="font-semibold text-lg">
                      {selectedFollower.totalOrders}
                    </div>
                  </div>

                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-green-600">Delivered</div>
                    <div className="font-semibold text-lg text-green-700">
                      {selectedFollower.deliveredOrders}
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-xs text-gray-500">
                  Followed at:{" "}
                  {new Date(selectedFollower.followedAt).toLocaleString()}
                </div>
              </>
            )}

            <button
              onClick={() => setSelectedFollower(null)}
              className="mt-5 w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}