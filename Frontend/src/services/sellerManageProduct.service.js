import axiosInstance from "../axios/axiosConfig";

export const getSellerProductsAPI = async (params) => {
  const res = await axiosInstance.get("/api/seller/products", { params });
  return res.data;
};

export const createSellerProductAPI = async (payload) => {
  const res = await axiosInstance.post("/api/seller/products", payload);
  return res.data;
};

export const getSellerProductDetailAPI = async (productId) => {
  const res = await axiosInstance.get(`/api/seller/products/${productId}`);
  return res.data;
};

export const updateSellerProductAPI = async (productId, payload) => {
  const res = await axiosInstance.put(`/api/seller/products/${productId}`, payload);
  return res.data;
};

export const getBrandsAPI = async () => {
  const res = await axiosInstance.get("/api/seller/brands");
  return res.data?.data || [];
};

export const getCategorySchemasAPI = async () => {
  const res = await axiosInstance.get("/api/seller/category-schemas");
  return res.data?.data || [];
};

export const deleteSellerProductAPI = async (productId) => {
  const res = await axiosInstance.delete(`/api/seller/products/${productId}`);
  return res.data;
};