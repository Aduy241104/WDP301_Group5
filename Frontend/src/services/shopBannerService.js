import axiosInstance from "../axios/axiosConfig";

export const getShopBannerAPI = async (shopId) => {
    const response = await axiosInstance.get(`/api/shop-banner/banner/${shopId}`);
    return response.data;
}

