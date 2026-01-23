import axiosInstance from "../axios/axiosConfig";

export const getDiscoverAPI = async () => {
    const res = await axiosInstance.get("/api/discovery");
    return res.data;
}

export const getProductDetailAPI = async (productId) => {
    const res = await axiosInstance.get(`api/discovery/product-detail/${productId}`);
    return res.data;
}