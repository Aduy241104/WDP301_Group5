import axiosInstance from "../axios/axiosConfig";

export const getDashboardStatTopProductAPI = async () => {
  const res = await axiosInstance.get("/api/seller/dashboard/top-products");
  return res.data;
};

export const getProductQuantityAPI = async () => {
  const res = await axiosInstance.get("/api/seller/dashboard/product-quantity");
  return res.data;
};