import axiosInstance from "../axios/axiosConfig";

export const getSellerCategoriesAPI = async () => {
  const res = await axiosInstance.get("/api/seller/categories");
  return res.data?.data || [];
};

export const createSellerCategoryAPI = async (payload) => {
  const res = await axiosInstance.post("/api/seller/categories", payload);
  return res.data;
};

export const updateSellerCategoryAPI = async (categoryId, payload) => {
  const res = await axiosInstance.put(`/api/seller/categories/${categoryId}`, payload);
  return res.data;
};

export const deleteSellerCategoryAPI = async (categoryId) => {
  const res = await axiosInstance.delete(`/api/seller/categories/${categoryId}`);
  return res.data;
};

export const getSellerCategoryProductsAPI = async (categoryId, params) => {
  const res = await axiosInstance.get(`/api/seller/categories/${categoryId}/products`, {
    params,
  });
  return res.data;
};

export const getSellerCategoryAvailableProductsAPI = async (categoryId, params) => {
  const res = await axiosInstance.get(
    `/api/seller/categories/${categoryId}/available-products`,
    { params }
  );
  return res.data;
};

export const addProductsToSellerCategoryAPI = async (categoryId, productIds) => {
  const res = await axiosInstance.post(`/api/seller/categories/${categoryId}/products`, {
    productIds,
  });
  return res.data;
};

export const deleteProductFromSellerCategoryAPI = async (categoryId, productId) => {
  const res = await axiosInstance.delete(
    `/api/seller/categories/${categoryId}/products/${productId}`
  );
  return res.data;
};