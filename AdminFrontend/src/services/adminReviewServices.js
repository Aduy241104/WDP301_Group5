import axiosInstance from "../axios/axiosConfig";

export const fetchAdminReviews = async (params = {}) => {
    const res = await axiosInstance.get("/api/admin/reviews", { params });
    return res.data;
};

export const fetchAdminProductReviews = async (productId, params = {}) => {
    const res = await axiosInstance.get(`/api/admin/products/${productId}/reviews`, { params });
    return res.data;
};

export const deleteAdminReview = async (reviewId) => {
    const res = await axiosInstance.delete(`/api/admin/reviews/${reviewId}`);
    return res.data;
};
