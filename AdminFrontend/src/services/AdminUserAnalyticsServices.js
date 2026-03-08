import axiosInstance from "../axios/axiosConfig";

// Get monthly user registrations
export const fetchMonthlyUserRegistrations = async (params = {}) => {
    const res = await axiosInstance.get("/api/admin/users/monthly-registrations", { params });
    return res.data;
};

// Get total users
export const fetchTotalUsers = async () => {
    const res = await axiosInstance.get("/api/admin/users/total");
    return res.data;
};

// Get new users today
export const fetchNewUsersToday = async () => {
    const res = await axiosInstance.get("/api/admin/users/new-today");
    return res.data;
};