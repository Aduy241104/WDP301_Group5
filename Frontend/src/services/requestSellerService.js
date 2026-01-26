import axiosInstance from "../axios/axiosConfig";

export const createSellerRequestAPI = async (payload) => {
    // POST /api/seller-requests
    const res = await axiosInstance.post("/api/seller-request/request", payload);
    return res.data;
};

export const checkSellerRequestAPI = async () => {
    const res = await axiosInstance.get("/api/seller-request/check");
    return res.data;
};

