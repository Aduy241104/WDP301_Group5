import { useEffect, useState } from "react";
import { getFollowerPurchaseConversionRate } from "../../../services/followService";

export default function SellerFollowerPurchaseConversionRate() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getFollowerPurchaseConversionRate();
      setData(res?.data ?? res ?? null);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const conversionRate = Number(data?.conversionRate ?? 0);

  return (
    <div className="p-6 bg-white rounded-xl shadow border border-gray-200">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Follower Purchase Conversion Rate
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Tỷ lệ follower có mua hàng (đã giao thành công) trên tổng số follower.
        </p>
      </div>

      {loading ? (
        <div className="py-10 text-center text-slate-500">Loading...</div>
      ) : error ? (
        <div className="py-4 rounded-lg bg-rose-50 text-rose-700 border border-rose-100">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm text-slate-600">Total followers</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {data?.totalFollowers ?? 0}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm text-slate-600">Purchased followers</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {data?.purchasedFollowersCount ?? 0}
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
      )}
    </div>
  );
}

