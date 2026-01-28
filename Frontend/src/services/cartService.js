import axiosInstance from "../axios/axiosConfig";

export const addToCartAPI = async ({variantId, quantity}) => {
    const response = await axiosInstance.post("/api/cart/add", {variantId, quantity});
    return response.data;
}