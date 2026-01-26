import axiosInstance from "../axios/axiosConfig";

export const getStoreInformationAPI = async () => {
  const res = await axiosInstance.get(`/api/seller/information`);
  return res.data;
};

export const updateStoreInformationAPI = async (payload) => {
  const res = await axiosInstance.put(`/api/seller/information`, payload);
  return res.data;
};
