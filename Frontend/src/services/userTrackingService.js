import axiosInstance from "../axios/axiosConfig";

export const userTrackingAPI = async (productId, eventType) => {
    const response = await axiosInstance.post("/api/user-event", {}, {
        params: {
            productId,
            eventType
        }
    });
    return response.data;
}