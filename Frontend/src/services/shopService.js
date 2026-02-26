import axiosInstance from "../axios/axiosConfig";

export const getSimilarShops = async (productId, page = 1, limit = 10) => {
  const res = await axiosInstance.get(
    `/api/shops/similar/${productId}?page=${page}&limit=${limit}`
  );
  return res.data;
};

export const getShopDetail = async (shopId) => {
  const res = await axiosInstance.get(`/api/shops/${shopId}`);
  return res.data;
};


export const getShopProducts = async (shopId, params = {}) => {
  const res = await axiosInstance.get(
    `/api/shops/${shopId}/products`,
    { params }
  );
  return res.data;
};

/**
 * Shop Categories
 */
export const getShopCategoriesAPI = async (shopId) => {
  const res = await axiosInstance.get(
    `/api/shops/shopcategories/${shopId}`
  );
  return res.data; 
};

/**
 * Products by Category
 */
export const getShopProductsByCategory = async (
  shopId,
  categoryId,
  params = {}
) => {
  const res = await axiosInstance.get(
    `/api/shops/${shopId}/categories/${categoryId}/products`,
    { params }
  );
  return res.data;
};