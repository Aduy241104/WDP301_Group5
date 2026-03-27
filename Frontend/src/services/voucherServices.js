import axiosInstance from "../axios/axiosConfig";

export const getVoucherByShopAPI = async (shopId) => {
    const response = await axiosInstance.get(`/api/voucher/voucher-by-shop/${shopId}`);
    return response.data;
}

export const getSystemVouchersAPI = async () => {
    const response = await axiosInstance.get(`/api/voucher/system-voucher`);
    return response.data;
}

