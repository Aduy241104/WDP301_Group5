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

export default {
  getShopFollowers,
  getFollowersCount
};