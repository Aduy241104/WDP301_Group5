import axiosInstance from "../axios/axiosConfig";

export const createOrder = async ({ variantIds = [] }) => {
    const response = await axiosInstance.post("/api/order/create-order", { variantIds });
    return response.data;
}