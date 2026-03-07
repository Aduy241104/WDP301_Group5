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

  const prevCount = useRef(0);

  const navigate = useNavigate();

  const { toast } = useToast(); // ⭐ QUAN TRỌNG

  const fetchNotifications = async (showToast = false) => {
    try {
      const data = await getNotificationsAPI();

      // kiểm tra notification mới
      if (showToast && data.length > prevCount.current) {
        const newest = data[0];

        toast.success(`🛒 ${newest.title}`);
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
    // load lần đầu
    fetchNotifications();

    // polling mỗi 5s
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Notifications</h2>

      {loading && (
        <div className="text-slate-500">Loading notifications...</div>
      )}

      {!loading && notifications.length === 0 && (
        <div className="bg-white rounded-xl shadow p-6 text-slate-500">
          No notifications
        </div>
      )}

      {!loading && notifications.length > 0 && (
        <div className="space-y-4">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => handleClick(n)}
              className={`bg-white rounded-xl shadow p-5 flex justify-between items-center hover:shadow-md transition cursor-pointer ${
                !n.isRead ? "border-l-4 border-indigo-500" : ""
              }`}
            >
              <div>
                <div className="font-semibold">{n.title}</div>

                <div className="text-sm text-slate-600">{n.message}</div>

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