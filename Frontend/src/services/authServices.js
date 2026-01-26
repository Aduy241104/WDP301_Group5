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

export const requestResetPasswordLinkAPI = async ({ email }) => {
    const res = await axiosInstance.post(`/api/auth/forgot-password`, { email });
    return res.data;
}

export const resetPasswordAPI = async ({ email, otp, newPassword }) => {
    const res = await axiosInstance.post(`/api/auth/reset-password`, { email, otp, newPassword });
    return res.data;
}

export const logoutAPI = async () => {
    const res = await axiosInstance.post(`/api/auth/logout`);
    return res.data;
}


export const testAPi = async () => {
    const res = await axiosInstance.get(`/api/user/test`);
    return res.data;
}