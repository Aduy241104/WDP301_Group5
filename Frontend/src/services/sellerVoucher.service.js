import axiosInstance from "../axios/axiosConfig";

export const getSellerVouchersAPI = async () => {
    const res = await axiosInstance.get("/api/seller/vouchers");
    return res.data;
};

export const createSellerVoucherAPI = async (payload) => {
    const res = await axiosInstance.post("/api/seller/vouchers", payload);
    return res.data;
};

export const updateSellerVoucherAPI = async (voucherId, payload) => {
    const res = await axiosInstance.put(`/api/seller/vouchers/${voucherId}`, payload);
    return res.data;
};

export const getSellerVoucherDetailAPI = async (voucherId) => {
    const res = await axiosInstance.get(`/api/seller/vouchers/${voucherId}`);
    return res.data;
};

export const deleteSellerVoucherAPI = async (voucherId) => {
    const res = await axiosInstance.delete(`/api/seller/vouchers/${voucherId}`);
    return res.data;
};
