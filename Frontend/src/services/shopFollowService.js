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


// GET /api/shop-follow/:shopId/is-following
export const checkFollowShopAPI = async (shopId) => {
    const res = await axiosInstance.get(`/api/shop-follow/${shopId}/is-following`);
    return res.data; 
};

export const getShopFollowersCountAPI = async (shopId) => {
    const res = await axiosInstance.get(`/api/shop-follow/${shopId}/followers`);
    return res.data;
}



export const getMyFollowingShopsAPI = async (page = 1, limit = 12) => {
    // Gọi method GET và truyền page, limit qua query
    const res = await axiosInstance.get(`/api/shop-follow/me/following/shops?page=${page}&limit=${limit}`);
    return res.data;
};

