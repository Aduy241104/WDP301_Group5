import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getNotificationsAPI,
  markNotificationReadAPI,
} from "../../../services/notificationService.js";
import { useToast } from "../../../context/ToastContext.jsx";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");

  // 🔥 pagination
  const [page, setPage] = useState(1);
  const limit = 10;

  const prevCount = useRef(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchNotifications = async (showToast = false) => {
    try {
      const data = await getNotificationsAPI();

      if (showToast && data.length > prevCount.current) {
        const newest = data[0];
        toast.success(`🔔 ${newest.title}`);
      }

      prevCount.current = data.length;
      setNotifications(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // reset page khi đổi tab
  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  const handleClick = async (n) => {
    try {
      if (!n.isRead) {
        await markNotificationReadAPI(n._id);

        setNotifications((prev) =>
          prev.map((item) =>
            item._id === n._id ? { ...item, isRead: true } : item
          )
        );
      }

      if (n.data?.url) {
        navigate(n.data.url);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ===== Filter =====
  const orderNotifications = notifications.filter((n) =>
    n.type?.startsWith("order")
  );

  const reportNotifications = notifications.filter((n) =>
    n.type?.includes("report")
  );

  const currentList =
    activeTab === "orders" ? orderNotifications : reportNotifications;

  // ===== Pagination =====
  const totalPages = Math.ceil(currentList.length / limit);

  const paginatedList = currentList.slice(
    (page - 1) * limit,
    page * limit
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Notifications</h2>

      {/* Tabs */}
      <div className="flex gap-4">
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2 rounded-lg ${
            activeTab === "orders"
              ? "bg-indigo-600 text-white"
              : "bg-white border"
          }`}
        >
          Orders ({orderNotifications.length})
        </button>

        <button
          onClick={() => setActiveTab("reports")}
          className={`px-4 py-2 rounded-lg ${
            activeTab === "reports"
              ? "bg-indigo-600 text-white"
              : "bg-white border"
          }`}
        >
          Reports ({reportNotifications.length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div>Loading...</div>
      ) : paginatedList.length === 0 ? (
        <div>No notifications</div>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedList.map((n) => (
              <div
                key={n._id}
                onClick={() => handleClick(n)}
                className={`p-4 bg-white rounded shadow cursor-pointer ${
                  !n.isRead ? "border-l-4 border-indigo-500" : ""
                }`}
              >
                <div className="font-semibold">{n.title}</div>
                <div className="text-sm">{n.message}</div>
                <div className="text-xs text-gray-400">
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </button>

            <span>
              Page {page} / {totalPages || 1}
            </span>

            <button
              onClick={() =>
                setPage((p) => (p < totalPages ? p + 1 : p))
              }
              disabled={page >= totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}