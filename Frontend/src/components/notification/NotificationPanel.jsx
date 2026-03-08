import { useEffect, useState } from "react";
import {
  getNotificationsAPI,
  markNotificationReadAPI,
} from "../../services/notificationService.js";
function NotificationPanel() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const data = await getNotificationsAPI();
      setNotifications(data);
    };

    fetchNotifications();
  }, []);

  const handleRead = async (id) => {
    await markNotificationReadAPI(id);

    const data = await getNotificationsAPI();
    setNotifications(data);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow border">
      <h3 className="text-lg font-semibold mb-4">Notifications</h3>

      {notifications.length === 0 ? (
        <p className="text-gray-400">Không có thông báo</p>
      ) : (
        notifications.map((n) => (
          <div
            key={n._id}
            className={`p-3 border-b cursor-pointer ${
              !n.isRead ? "bg-blue-50" : ""
            }`}
            onClick={() => handleRead(n._id)}
          >
            <p className="font-semibold">{n.title}</p>
            <p className="text-sm text-gray-600">{n.message}</p>

            <p className="text-xs text-gray-400 mt-1">
              {new Date(n.createdAt).toLocaleString()}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export default NotificationPanel;