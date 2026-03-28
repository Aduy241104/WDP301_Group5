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

export const getSellerShopReportsAPI = async (params) => {
  const res = await axiosInstance.get(
    `/api/seller/reports/shop-reports`,
    { params }
  );
  return res.data;
};
export const getSellerShopReportDetailAPI = async (id) => {
  const res = await axiosInstance.get(`/api/seller/shop-reports/${id}`);
  return res.data;
};