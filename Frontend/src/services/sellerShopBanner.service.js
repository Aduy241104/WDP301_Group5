import axiosInstance from "../axios/axiosConfig";

export const getShopBannersAPI = async () => {
  const res = await axiosInstance.get("/api/seller/shop/banners");
  return res.data;
};

export const addShopBannerAPI = async (payload) => {
  const res = await axiosInstance.post("/api/seller/shop/banners", payload);
  return res.data;
};

export const updateShopBannerAPI = async (bannerId, payload) => {
  const res = await axiosInstance.put(`/api/seller/shop/banners/${bannerId}`, payload);
  return res.data;
};

export const deleteShopBannerAPI = async (bannerId) => {
  const res = await axiosInstance.delete(`/api/seller/shop/banners/${bannerId}`);
  return res.data;
};
