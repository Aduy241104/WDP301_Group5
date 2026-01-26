import axiosInstance from "../axios/axiosConfig";

// Banner Management
export const fetchBannerList = async (params = {}) => {
    const res = await axiosInstance.get("/api/admin/banners", { params });
    return res.data;
};

export const createBanner = async (data) => {
    const res = await axiosInstance.post("/api/admin/banners", data);
    return res.data;
};

export const updateBanner = async (bannerId, data) => {
    const res = await axiosInstance.put(`/api/admin/banners/${bannerId}`, data);
    return res.data;
};

export const deleteBanner = async (bannerId) => {
    const res = await axiosInstance.delete(`/api/admin/banners/${bannerId}`);
    return res.data;
};


