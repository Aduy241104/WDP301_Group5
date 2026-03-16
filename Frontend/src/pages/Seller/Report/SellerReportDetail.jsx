import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSellerReportDetailAPI } from "../../../services/sellerReportService";

export default function SellerReportDetail() {
  const { reportId } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    try {
      const data = await getSellerReportDetailAPI(reportId);
      setReport(data.report);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportId]);

  if (loading) {
    return (
      <div className="p-10 text-center text-slate-500">
        Loading report...
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-10 text-center text-red-500">
        Report not found
      </div>
    );
  }

  const statusColor =
    report.status === "closed"
      ? "bg-green-100 text-green-700"
      : "bg-yellow-100 text-yellow-700";

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">
          Report Detail
        </h2>

        <button
          onClick={() => navigate("/seller/products")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go to Products
        </button>
      </div>

      {/* main info */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* report info */}
        <div className="bg-white rounded-xl shadow p-6 space-y-5">

          <div>
            <div className="text-sm text-slate-500">
              Product
            </div>
            <div className="font-medium text-lg">
              {report.targetSnapshot?.name}
            </div>
          </div>

          <div>
            <div className="text-sm text-slate-500">
              Category
            </div>
            <div className="capitalize">
              {report.category}
            </div>
          </div>

          <div>
            <div className="text-sm text-slate-500">
              Status
            </div>

            <span
              className={`inline-block mt-1 px-3 py-1 text-sm rounded-full ${statusColor}`}
            >
              {report.status}
            </span>
          </div>

          <div>
            <div className="text-sm text-slate-500">
              Created
            </div>
            <div>
              {new Date(report.createdAt).toLocaleString()}
            </div>
          </div>
        </div>

        {/* report content */}
        <div className="bg-white rounded-xl shadow p-6 space-y-5">

          <div>
            <div className="text-sm text-slate-500">
              Customer Reason
            </div>
            <div className="font-medium">
              {report.reason}
            </div>
          </div>

          {report.description && (
            <div>
              <div className="text-sm text-slate-500">
                Customer Description
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                {report.description}
              </div>
            </div>
          )}

          {/* admin message */}
          {report.adminMessage && (
            <div>
              <div className="text-sm text-slate-500">
                Admin Response
              </div>

              <div className="bg-blue-50 text-blue-800 p-3 rounded-lg">
                {report.adminMessage}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* images */}
      {report.images?.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6">

          <div className="text-sm text-slate-500 mb-4">
            Evidence Images
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {report.images.map((img, i) => (
              <img
                key={i}
                src={img}
                className="rounded-lg border hover:scale-105 transition cursor-pointer"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}