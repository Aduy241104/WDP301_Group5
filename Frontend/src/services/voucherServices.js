import axiosInstance from "../axios/axiosConfig";

export const getVoucherByShopAPI = async (shopId) => {
    const response = await axiosInstance.get(`/api/voucher/voucher-by-shop/${shopId}`);
    return response.data;
}

