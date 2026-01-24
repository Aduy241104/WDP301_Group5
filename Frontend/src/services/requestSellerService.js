import axiosInstance from "../axios/axiosConfig";

export const createSellerRequestAPI = async (payload) => {
    // POST /api/seller-requests
    const res = await axiosInstance.post("/api/seller-request/request", payload);
    return res.data;
};
