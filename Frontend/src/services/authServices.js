import { email } from "zod";
import axiosInstance from "../axios/axiosConfig";


export const loginAPI = async ({ email, password }) => {
    const res = await axiosInstance.post(`/api/auth/login`, { email, password });
    return res.data;
}

export const requestRegisterOtpAPI = async ({ email }) => {
    const res = await axiosInstance.post(`/api/otp/request-otp`, { email });
    return res.data;
}

export const registerAPI = async (data) => {
    const res = await axiosInstance.post(`/api/auth/register`, data);
    return res.data;
}


export const testAPi = async () => {
    const res = await axiosInstance.get(`/api/user/test`);
    return res.data;
}