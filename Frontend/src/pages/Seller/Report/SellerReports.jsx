import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  getSellerReportsAPI,
  getSellerShopReportsAPI,
} from "../../../services/sellerReportService";

function StatusPill({ status }) {
  const map = {
    closed: { cls: "bg-green-100 text-green-800", label: "Đã đóng" },
    open: { cls: "bg-blue-100 text-blue-800", label: "Đang mở" },
    reopened: { cls: "bg-amber-100 text-amber-800", label: "Đã mở lại" },
  };
  const it = map[status] ?? { cls: "bg-slate-100 text-slate-700", label: status };
  return (
    <span className={`px-2 py-1 text-xs rounded ${it.cls}`}>
      {it.label}
    </span>
  );
}

export default function SellerReports() {
  const [tab, setTab] = useState("product");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔥 pagination
  const [page, setPage] = useState(1);
  const [paging, setPaging] = useState({});

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      let res;

      if (tab === "product") {
        res = await getSellerReportsAPI({ page, limit: 10 });
      } else {
        res = await getSellerShopReportsAPI({ page, limit: 10 });
      }

      setReports(res?.reports ?? []);
      setPaging(res?.paging ?? {});
    } catch (err) {
      setError(err?.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  // load data
  useEffect(() => {
    load();
  }, [tab, page]);

  // reset page khi đổi tab
  useEffect(() => {
    setPage(1);
  }, [tab]);

  const stats = useMemo(() => {
    return {
      total: reports.length,
      open: reports.filter((r) => r.status === "open").length,
      closed: reports.filter((r) => r.status === "closed").length,
      reopened: reports.filter((r) => r.status === "reopened").length,
    };
  }, [reports]);

  return (
    <div className="p-6 bg-white rounded-xl shadow border">

      {/* 🔥 TAB */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("product")}
          className={`px-4 py-2 rounded ${
            tab === "product"
              ? "bg-indigo-600 text-white"
              : "bg-gray-100"
          }`}
        >
          Product Reports
        </button>

        <button
          onClick={() => setTab("shop")}
          className={`px-4 py-2 rounded ${
            tab === "shop"
              ? "bg-indigo-600 text-white"
              : "bg-gray-100"
          }`}
        >
          Shop Reports
        </button>
      </div>

      {/* HEADER */}
      <div className="flex justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {tab === "product" ? "Product Reports" : "Shop Reports"}
        </h2>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>Open: {stats.open}</div>
        <div>Closed: {stats.closed}</div>
        <div>Reopened: {stats.reopened}</div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : reports.length === 0 ? (
        <div className="text-center py-10">No reports</div>
      ) : (
        <>
          <table className="w-full text-sm border">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Target</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Reason</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Created</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {reports.map((r) => (
                <tr key={r._id} className="border-t">
                  <td className="p-3">
                    {r.target?.name || "—"}
                  </td>
                  <td className="p-3">{r.category}</td>
                  <td className="p-3">{r.reason}</td>
                  <td className="p-3">
                    <StatusPill status={r.status} />
                  </td>
                  <td className="p-3">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-right">
                    <Link to={`/seller/reports/${r._id}`}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 🔥 PAGINATION */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>

            <span>
              Page {paging.page || 1} / {paging.totalPages || 1}
            </span>

            <button
              onClick={() =>
                setPage((p) =>
                  p < (paging.totalPages || 1) ? p + 1 : p
                )
              }
              disabled={page >= (paging.totalPages || 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}