import axiosInstance from "../axios/axiosConfig";

// View user list (with search keyword)
export const fetchUserList = async (params = {}) => {
    const res = await axiosInstance.get("/api/admin/users", { params });
    return res.data;
};

// View user profile
export const fetchUserProfile = async (userId) => {
    const res = await axiosInstance.get(`/api/admin/users/${userId}/profile`);
    return res.data;
};

// Block / Unblock user
export const blockUser = async (userId) => {
    const res = await axiosInstance.post(`/api/admin/users/${userId}/block`);
    return res.data;
};

export const unblockUser = async (userId) => {
    const res = await axiosInstance.post(`/api/admin/users/${userId}/unblock`);
    return res.data;
};
