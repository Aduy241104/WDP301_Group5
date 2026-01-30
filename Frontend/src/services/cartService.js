import axiosInstance from "../axios/axiosConfig";

export const addToCartAPI = async ({ variantId, quantity }) => {
    const response = await axiosInstance.post("/api/cart/add", { variantId, quantity });
    return response.data;
}

export const getCartAPI = async () => {
    const response = await axiosInstance.get("/api/cart");
    return response.data;
}

export const deleteItemInCartAPI = async ({ variantId }) => {
    const response = await axiosInstance.delete(`/api/cart/delete/${variantId}`);
    return response.data;
}

export const updateItemInCartAPI = async ( variantId, quantity ) => {
    const response = await axiosInstance.patch(`/api/cart/update/${variantId}`, { quantity });
    return response.data;
}

export default {
    addToCartAPI,
    getCartAPI,
    deleteItemInCartAPI,
    updateItemInCartAPI
}
