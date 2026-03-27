import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getNotificationsAPI } from "../services/notificationService";

export default function useSellerNotifications() {

  const [popup, setPopup] = useState(null);
  const lastNewestId = useRef(null);
  const isFirstLoad = useRef(true);

  const navigate = useNavigate();

  useEffect(() => {

    const checkNotifications = async () => {

      try {

        const data = await getNotificationsAPI();

        const newest = data?.[0] || null;

        // lần load đầu → chỉ lưu id của notification mới nhất
        if (isFirstLoad.current) {
          lastNewestId.current = newest?._id ?? null;
          isFirstLoad.current = false;
          return;
        }

        // notification mới nhất đổi (dù list bị limit 20 vẫn phát hiện được)
        if (newest?._id && newest._id !== lastNewestId.current) {
          lastNewestId.current = newest._id;
          setPopup(newest);

        }

      } catch (err) {
        console.error(err);
      }

    };

    checkNotifications();

    const interval = setInterval(checkNotifications, 5000);

    return () => clearInterval(interval);

  }, []);

  const close = () => setPopup(null);

  const open = () => {

    if (popup?.data?.url) {
      navigate(popup.data.url);
      setPopup(null);
    }

  };

  return { popup, close, open };

}