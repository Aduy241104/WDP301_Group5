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

  // ===== Filter Notifications =====

  const orderNotifications = notifications.filter((n) =>
    n.type?.startsWith("order")
  );

  const reportNotifications = notifications.filter((n) =>
    n.type?.includes("report")
  );

  const currentList =
    activeTab === "orders" ? orderNotifications : reportNotifications;

  // ===== Render =====

  return (
    <div className="space-y-6">

      <h2 className="text-2xl font-semibold">Notifications</h2>

      {/* ===== Tabs ===== */}

      <div className="flex gap-4">

        <button
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
            activeTab === "orders"
              ? "bg-indigo-600 text-white"
              : "bg-white border hover:bg-slate-50"
          }`}
        >
          🛒 Orders
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              activeTab === "orders"
                ? "bg-white text-indigo-600"
                : "bg-slate-200"
            }`}
          >
            {orderNotifications.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("reports")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
            activeTab === "reports"
              ? "bg-indigo-600 text-white"
              : "bg-white border hover:bg-slate-50"
          }`}
        >
          🚨 Reports
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              activeTab === "reports"
                ? "bg-white text-indigo-600"
                : "bg-slate-200"
            }`}
          >
            {reportNotifications.length}
          </span>
        </button>

      </div>

      {/* ===== Loading ===== */}

      {loading && (
        <div className="text-slate-500">
          Loading notifications...
        </div>
      )}

      {/* ===== Notification List ===== */}

      {!loading && currentList.length === 0 && (
        <div className="bg-white rounded-xl shadow p-6 text-slate-500">
          No notifications
        </div>
      )}

      {!loading && currentList.length > 0 && (
        <div className="space-y-4">

          {currentList.map((n) => (
            <div
              key={n._id}
              onClick={() => handleClick(n)}
              className={`bg-white rounded-xl shadow p-5 flex justify-between items-center hover:shadow-md transition cursor-pointer ${
                !n.isRead ? "border-l-4 border-indigo-500" : ""
              }`}
            >

              <div>
                <div className="font-semibold">
                  {n.title}
                </div>

                <div className="text-sm text-slate-600">
                  {n.message}
                </div>

                <div className="text-xs text-slate-400 mt-1">
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>

              {!n.isRead && (
                <div className="text-xs text-indigo-600 font-medium">
                  New
                </div>
              )}

            </div>
          ))}

        </div>
      )}

    </div>
  );
}