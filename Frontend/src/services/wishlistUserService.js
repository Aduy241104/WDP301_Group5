import axiosInstance from "../axios/axiosConfig";

export const getWishlistAPI = async () => {
  const res = await axiosInstance.get("/api/wishlist");
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