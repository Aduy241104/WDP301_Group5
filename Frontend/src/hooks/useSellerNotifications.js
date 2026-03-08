import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getNotificationsAPI } from "../services/notificationService";

export default function useSellerNotifications() {

  const [popup, setPopup] = useState(null);

  const prevCount = useRef(0);
  const isFirstLoad = useRef(true);

  const navigate = useNavigate();

  useEffect(() => {

    const checkNotifications = async () => {

      try {

        const data = await getNotificationsAPI();

        // lần load đầu → chỉ lưu count
        if (isFirstLoad.current) {
          prevCount.current = data.length;
          isFirstLoad.current = false;
          return;
        }

        // nếu có notification mới
        if (data.length > prevCount.current) {

          const newest = data[0];

          setPopup(newest);

        }

        prevCount.current = data.length;

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