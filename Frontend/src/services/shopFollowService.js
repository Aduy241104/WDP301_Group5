import axiosInstance from "../axios/axiosConfig";

// POST /api/shop-follow/:shopId/follow
export const followShopAPI = async (shopId) => {
    const res = await axiosInstance.post(`/api/shop-follow/${shopId}/follow`);
    return res.data;
};

// DELETE /api/shop-follow/:shopId/follow
export const unfollowShopAPI = async (shopId) => {
    const res = await axiosInstance.delete(`/api/shop-follow/${shopId}/follow`);
    return res.data;
};

// GET /api/shop-follow/me/following/shops
export const getMyFollowingShopsAPI = async (params = {}) => {
    // params có thể dùng cho pagination/search nếu backend hỗ trợ
    const res = await axiosInstance.get(`/api/shop-follow/me/following/shops`, { params });
    return res.data;
};


// GET /api/shop-follow/:shopId/is-following
export const checkFollowShopAPI = async (shopId) => {
    const res = await axiosInstance.get(`/api/shop-follow/${shopId}/is-following`);
    return res.data; 
};

export const getShopFollowersCountAPI = async (shopId) => {
    const res = await axiosInstance.get(`/api/shop-follow/${shopId}/followers`);
    return res.data;
}