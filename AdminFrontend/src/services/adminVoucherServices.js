import axiosInstance from "../axios/axiosConfig";

export const fetchSystemVouchers = async () => {
    const res = await axiosInstance.get("/api/admin/vouchers");
    return res.data;
};

export const createSystemVoucher = async (payload) => {
    const res = await axiosInstance.post("/api/admin/vouchers", payload);
    return res.data;
};

export const fetchSystemVoucherDetail = async (voucherId) => {
    const res = await axiosInstance.get(`/api/admin/vouchers/${voucherId}`);
    return res.data;
};

export const updateSystemVoucher = async (voucherId, payload) => {
    const res = await axiosInstance.put(`/api/admin/vouchers/${voucherId}`, payload);
    return res.data;
};

export const toggleSystemVoucher = async (voucherId, isActive) => {
    const res = await axiosInstance.put(`/api/admin/vouchers/${voucherId}/toggle`, { isActive });
    return res.data;
};

export const deleteSystemVoucher = async (voucherId) => {
    const res = await axiosInstance.delete(`/api/admin/vouchers/${voucherId}`);
    return res.data;
};
