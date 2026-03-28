import axiosInstance from "../axios/axiosConfig";

export const notifySellerReportResult = async (reportId, body) => {
    const res = await axiosInstance.post(`/api/admin/reports/${reportId}/notify-seller`, body);
    return res.data;
};

export const broadcastSellersNotification = async (body) => {
    const res = await axiosInstance.post("/api/admin/notifications/broadcast-sellers", body);
    return res.data;
};

/** Gửi cho danh sách seller cụ thể: { title, message, sellerUserIds: string[] } */
export const notifySelectedSellers = async (body) => {
    const res = await axiosInstance.post("/api/admin/notifications/selected-sellers", body);
    return res.data;
};

/** Seller active để chọn trên UI (keyword, limit) */
export const fetchSellerNotifyCandidates = async (params = {}) => {
    const res = await axiosInstance.get("/api/admin/sellers/notify-candidates", { params });
    return res.data;
};
