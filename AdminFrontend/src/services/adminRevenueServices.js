import axiosInstance from "../axios/axiosConfig";

// Get GMV Statistics - View total GMV by day and month
export const fetchGMVStatistics = async (params = {}) => {
    const res = await axiosInstance.get("/api/admin/revenue/gmv-statistics", { params });
    return res.data;
};

// Get Revenue by Shop - View revenue statistics by shop
export const fetchRevenueByShop = async (params = {}) => {
    const res = await axiosInstance.get("/api/admin/revenue/by-shop", { params });
    return res.data;
};
