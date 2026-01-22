import axiosInstance from "../axios/axiosConfig";

export const getDiscoverAPI = async () => {
    const res = await axiosInstance.get("/api/discovery");
    return res.data;
}