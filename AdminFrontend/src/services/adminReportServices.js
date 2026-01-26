import axiosInstance from "../axios/axiosConfig";

// Report Management
export const fetchReportList = async (params = {}) => {
    const res = await axiosInstance.get("/api/admin/reports", { params });
    return res.data;
};

export const fetchReportDetail = async (reportId) => {
    const res = await axiosInstance.get(`/api/admin/reports/${reportId}`);
    return res.data;
};
