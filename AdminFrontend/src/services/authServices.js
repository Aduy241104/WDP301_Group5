import axiosInstance from "../axios/axiosConfig";


export const loginAPI = async ({ email, password }) => {
    const res = await axiosInstance.post(`/api/auth/login`, { email, password });
    return res.data;
}


export const testAPi = async () => {
    const res = await axiosInstance.get(`/api/user/test`);
    return res.data;
}