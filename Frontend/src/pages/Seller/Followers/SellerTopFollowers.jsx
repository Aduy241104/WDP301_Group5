import { useEffect, useMemo, useState } from "react";
import { getTopFollowersByNumberOfOrders } from "../../../services/followService";

export default function SellerTopFollowers() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [limit, setLimit] = useState(10);
  const [result, setResult] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getTopFollowersByNumberOfOrders(limit);
      setResult(data?.data ?? data ?? null);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit]);

  const items = useMemo(() => result?.items ?? [], [result]);

  return (
    <div className="p-6 bg-white rounded-xl shadow border border-gray-200">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Top Followers (by Orders)
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Xếp hạng người theo dõi dựa trên số đơn đã giao thành công.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600 font-medium" htmlFor="limit">
            Limit
          </label>
          <select
            id="limit"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
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

      {loading ? (
        <div className="py-10 text-center text-slate-500">Loading...</div>
      ) : error ? (
        <div className="py-4 rounded-lg bg-rose-50 text-rose-700 border border-rose-100">
          {error}
        </div>
      ) : items.length === 0 ? (
        <div className="py-10 text-center text-slate-500">
          No top followers found.
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-slate-600">
            Total followers:{" "}
            <span className="font-semibold text-slate-900">
              {result?.totalFollowers ?? 0}
            </span>
          </div>

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
                {items.map((row) => (
                  <tr key={row?.user?._id || row?.user?._id} className="border-b">
                    <td className="p-3">
                      <img
                        src={row?.user?.avatar || "/default-avatar.png"}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover"
                      />
                    </td>
                    <td className="p-3">
                      {row?.user?.fullname || "—"}
                    </td>
                    <td className="p-3">{row?.user?.email || "—"}</td>
                    <td className="p-3 text-right font-semibold">
                      {row?.orderCount ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

