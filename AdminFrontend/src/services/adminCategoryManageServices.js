import axiosInstance from "../axios/axiosConfig";

/** Danh sách category đầy đủ (admin) */
export const fetchAdminCategoryManageList = async (params = {}) => {
    const res = await axiosInstance.get("/api/admin/Category/manage", { params });
    return res.data;
};

export const fetchAdminCategoryById = async (categoryId) => {
    const res = await axiosInstance.get(`/api/admin/Category/${categoryId}`);
    return res.data;
};

export const createAdminCategory = async (data) => {
    const res = await axiosInstance.post("/api/admin/Category", data);
    return res.data;
};

export const updateAdminCategory = async (categoryId, data) => {
    const res = await axiosInstance.put(`/api/admin/Category/${categoryId}`, data);
    return res.data;
};
