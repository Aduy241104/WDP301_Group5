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


export const getShopProducts = async (shopId, page = 1, limit = 20) => {
  const res = await axiosInstance.get(
    `/api/shops/${shopId}/products?page=${page}&limit=${limit}`
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
  shopCategoryId,
  page = 1,
  limit = 20,
  sortBy = "createdAt",
  order = "desc"
) => {
  const res = await axiosInstance.get(
    `/api/shops/${shopId}/categories/${shopCategoryId}/products`, // ✔ đúng router
    {
      params: { page, limit, sortBy, order },
    }
  );
  return res.data;
};
