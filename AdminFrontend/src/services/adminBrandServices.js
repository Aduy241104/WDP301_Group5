import axiosInstance from "../axios/axiosConfig";

// Get all brands
export const fetchBrands = async (params = {}) => {
    const res = await axiosInstance.get("/api/admin/brands", { params });
    return res.data;
};

// Get brand by ID
export const fetchBrandById = async (brandId) => {
    const res = await axiosInstance.get(`/api/admin/brands/${brandId}`);
    return res.data;
};

// Create brand
export const createBrand = async (data) => {
    const res = await axiosInstance.post("/api/admin/brands", data);
    return res.data;
};

// Update brand
export const updateBrand = async (brandId, data) => {
    const res = await axiosInstance.put(`/api/admin/brands/${brandId}`, data);
    return res.data;
};

// Delete brand
export const deleteBrand = async (brandId) => {
    const res = await axiosInstance.delete(`/api/admin/brands/${brandId}`);
    return res.data;
};

// Get all categories
export const fetchCategories = async () => {
    const res = await axiosInstance.get("/api/admin/Category");
    return res.data;
};

// Get category by ID
export const fetchCategoryById = async (categoryId) => {
    const res = await axiosInstance.get(`/api/admin/Category/${categoryId}`);
    return res.data;
};