import axiosInstance from "../axios/axiosConfig";

// Get banners by position (public API)
export const getBannersByPosition = async (position) => {
    const res = await axiosInstance.get(`/api/banners/${position}`);
    return res.data;
};

export const getAllHomeBannersAPI = async () => {
    const res = await axiosInstance.get(`/api/banners/system-banners`);
    return res.data;
};

