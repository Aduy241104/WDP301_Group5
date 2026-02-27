import axiosInstance from "../axios/axiosConfig";

export const getSellerCategoriesAPI = async () => {
  const res = await axiosInstance.get("/api/seller/categories");
  return res.data?.data || [];
};

export const createSellerCategoryAPI = async (payload) => {
  const res = await axiosInstance.post("/api/seller/categories", payload);
  return res.data;
};

