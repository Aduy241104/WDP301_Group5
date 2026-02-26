import axiosInstance from "../axios/axiosConfig";

// View seller registration list
export const fetchSellerRegistrations = async (params = {}) => {
    const res = await axiosInstance.get("/api/admin/seller-registrations", { params });
    return res.data;
};

// Filter seller registrations by status
export const fetchSellerRegistrationsByStatus = async ({ status, ...rest }) => {
    const res = await axiosInstance.get("/api/admin/seller-registrations/by-status", {
        params: { status, ...rest },
    });
    return res.data;
};

// View detailed seller profile
export const fetchSellerProfile = async (userId) => {
    const res = await axiosInstance.get(`/api/admin/sellers/${userId}/profile`);
    return res.data;
};

// Approve / Reject seller
export const approveSellerRequest = async (requestId) => {
    const res = await axiosInstance.post(`/api/admin/seller-registrations/${requestId}/approve`);
    return res.data;
};

export const rejectSellerRequest = async (requestId, rejectReason) => {
    const res = await axiosInstance.post(`/api/admin/seller-registrations/${requestId}/reject`, {
        rejectReason,
    });
    return res.data;
};

// Block / Unblock seller
export const blockSeller = async (userId) => {
    const res = await axiosInstance.post(`/api/admin/sellers/${userId}/block`);
    return res.data;
};

export const unblockSeller = async (userId) => {
    const res = await axiosInstance.post(`/api/admin/sellers/${userId}/unblock`);
    return res.data;
};

// View list of sellers (approved sellers)
export const fetchSellerList = async (params = {}) => {
    const res = await axiosInstance.get("/api/admin/sellers", { params });
    return res.data;
};

// View shop list
export const fetchShopList = async (params = {}) => {
    const res = await axiosInstance.get("/api/admin/shops", { params });
    return res.data;
};

// View shop detail
export const fetchShopDetail = async (shopId) => {
    const res = await axiosInstance.get(`/api/admin/shops/${shopId}`);
    return res.data;
};

// Block / Unblock shop
export const blockShop = async (shopId) => {
    const res = await axiosInstance.post(`/api/admin/shops/${shopId}/block`);
    return res.data;
};

export const unblockShop = async (shopId) => {
    const res = await axiosInstance.post(`/api/admin/shops/${shopId}/unblock`);
    return res.data;
};
