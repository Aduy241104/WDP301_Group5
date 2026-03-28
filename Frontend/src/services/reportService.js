import axiosInstance from "../axios/axiosConfig";

// ================= CREATE GENERIC REPORT =================
export const createReportAPI = async (data) => {
    const response = await axiosInstance.post("/api/report/create-report", data);
    return response.data;
};

// ================= PRODUCT REPORT =================
export const sendProductReportAPI = async (data) => {
    const response = await axiosInstance.post(
        "/api/report/send-product-report",
        data
    );
    return response.data;
};

// ================= SHOP REPORT =================
export const sendShopReportAPI = async (data) => {
    const response = await axiosInstance.post(
        "/api/report/send-shop-report",
        data
    );
    return response.data;
};


export const checkReportedAPI = async ({ targetType, targetId }) => {
  const res = await axiosInstance.get("/api/report/check", {
    params: { targetType, targetId },
  });
  return res.data;
};