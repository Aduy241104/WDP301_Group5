import axiosInstance from "../axios/axiosConfig";


// lấy review của product
export const getProductReviewsAPI = async (productId, params = {}) => {
  const res = await axiosInstance.get(`/api/reviews/product/${productId}`, {
    params
  });

  return res.data;
};


// thêm review
export const addReviewAPI = async (body) => {
  const res = await axiosInstance.post(`/api/reviews`, body);

  return res.data;
};


// update review
export const updateReviewAPI = async (reviewId, body) => {
  const res = await axiosInstance.put(`/api/reviews/${reviewId}`, body);

  return res.data;
};


// delete review
export const deleteReviewAPI = async (reviewId) => {
  const res = await axiosInstance.delete(`/api/reviews/${reviewId}`);

  return res.data;
};


export default {
  getProductReviewsAPI,
  addReviewAPI,
  updateReviewAPI,
  deleteReviewAPI,
};