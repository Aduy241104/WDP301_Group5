import axiosInstance from "../axios/axiosConfig";

// View product list with filters (status, activeStatus, shop, keyword)
export const fetchAdminProductList = async (params = {}) => {
    const res = await axiosInstance.get("/api/admin/products", { params });
    return res.data;
};

// View product detail
export const fetchAdminProductDetail = async (productId) => {
    const res = await axiosInstance.get(`/api/admin/products/${productId}`);
    return res.data;
};

// Approve / Reject product
export const approveProduct = async (productId) => {
    const res = await axiosInstance.post(`/api/admin/products/${productId}/approve`);
    return res.data;
};

export const rejectProduct = async (productId, rejectReason) => {
    const res = await axiosInstance.post(`/api/admin/products/${productId}/reject`, {
        rejectReason,
    });
    return res.data;
};

// Activate / Inactivate product
export const activateProduct = async (productId) => {
    const res = await axiosInstance.post(`/api/admin/products/${productId}/activate`);
    return res.data;
};

export const inactivateProduct = async (productId, inactiveReason) => {
    const res = await axiosInstance.post(`/api/admin/products/${productId}/inactivate`, {
        inactiveReason,
    });
    return res.data;
};

