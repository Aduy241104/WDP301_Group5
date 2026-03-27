import axiosInstance from "../axios/axiosConfig";

export const getDiscoverAPI = async () => {
    const res = await axiosInstance.get("/api/discovery");
    return res.data;
}

export const getProductDetailAPI = async (productId) => {
    const res = await axiosInstance.get(`api/discovery/product-detail/${productId}`);
    return res.data;
}

export const getTopSaleProductAPI = async ({ page, limit }) => {
    const res = await axiosInstance.get("http://localhost:8080/api/discovery/top-sale", {
        params: {
            page,
            limit
        }
    });
    return res.data;
}

export const searchProductsAPI = async (filters) => {
    // Dùng POST và truyền filters vào body
    const res = await axiosInstance.post("/api/discovery/search", filters);
    return res.data;
};

export const getProductsByIdsAPI = async (ids) => {
    const res = await axiosInstance.post("/api/discovery/by-ids", {
        ids,
    });

    return res.data;
};