import axiosInstance from "../axios/axiosConfig";

export const getSellerReportsAPI = async (params) => {
  const res = await axiosInstance.get(`/api/seller/reports`, {
    params,
  });
  return res.data;
};

export const getSellerReportDetailAPI = async (id) => {
  const res = await axiosInstance.get(`/api/seller/reports/${id}`);
  return res.data;
};