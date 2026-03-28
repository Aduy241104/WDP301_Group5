import axiosInstance from "../axios/axiosConfig";

export const getShopFollowers = async (page = 1, limit = 10) => {
  const res = await axiosInstance.get(
    `/api/seller/followers?page=${page}&limit=${limit}`
  );
  return res.data;
};

export const getFollowersCount = async () => {
  const res = await axiosInstance.get(`/api/seller/followers/count`);
  return res.data;
};

// GET /api/seller/followers/top-by-orders?limit=10
export const getTopFollowersByNumberOfOrders = async (limit = 10) => {
  const res = await axiosInstance.get(`/api/seller/followers/top-by-orders`, {
    params: { limit },
  });
  return res.data;
};

// GET /api/seller/followers/purchase-conversion-rate
export const getFollowerPurchaseConversionRate = async () => {
  const res = await axiosInstance.get(
    `/api/seller/followers/purchase-conversion-rate`,
  );
  return res.data;
};

export default {
  getShopFollowers,
  getFollowersCount,
  getTopFollowersByNumberOfOrders,
  getFollowerPurchaseConversionRate,
};