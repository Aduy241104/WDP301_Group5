import axiosInstance from "../axios/axiosConfig";

export const getWishlistAPI = async (page = 1, limit = 10) => {
  const res = await axiosInstance.get(
    `/api/wishlist?page=${page}&limit=${limit}`
  );
  return res.data;
};

export const addWishlistAPI = async (productId) => {
  const res = await axiosInstance.post(`/api/wishlist/${productId}`);
  return res.data;
};

export const removeWishlistAPI = async (productId) => {
  const res = await axiosInstance.delete(`/api/wishlist/${productId}`);
  return res.data;
};

export default {
  getWishlistAPI,
  removeWishlistAPI
};