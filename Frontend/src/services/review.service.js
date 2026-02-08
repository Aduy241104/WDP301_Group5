import axiosInstance from "../axios/axiosConfig";

export const getReviewsAPI = async (params) => {
  const res = await axiosInstance.get(`/api/seller/reviews`, { params });
  return res.data;
};

export const replyReviewAPI = async (id, body) => {
  const res = await axiosInstance.patch(`/api/seller/reviews/${id}/reply`, body);
  return res.data;
};

export const getReviewStatsAPI = async (period = "month") => {
  const res = await axiosInstance.get(`/api/seller/reviews/stats`, { params: { period } });
  return res.data;
};

export default {
  getReviewsAPI,
  replyReviewAPI,
  getReviewStatsAPI,
};
