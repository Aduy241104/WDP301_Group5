import axiosInstance from "../axios/axiosConfig";

export const getSellerInventoriesAPI = async (params) => {
  const res = await axiosInstance.get("/api/seller/inventory", { params });
  return res.data;
};

export const getSellerProductInventoryAPI = async (productId) => {
  const res = await axiosInstance.get(`/api/seller/inventory/product/${productId}`);
  return res.data;
};

export const updateSellerInventoryStockAPI = async (inventoryId, payload) => {
  const res = await axiosInstance.put(`/api/seller/inventory/${inventoryId}`, payload);
  return res.data;
};
