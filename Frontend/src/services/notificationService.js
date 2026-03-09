import axiosInstance from "../axios/axiosConfig";

export const getNotificationsAPI = async () => {
  const res = await axiosInstance.get("/api/notifications");
  return res.data;
};

export const getUnreadNotificationCountAPI = async () => {
  const res = await axiosInstance.get("/api/notifications/unread-count");
  return res.data;
};

export const markNotificationReadAPI = async (id) => {
  const res = await axiosInstance.patch(`/api/notifications/${id}/read`);
  return res.data;
};