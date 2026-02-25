import axiosInstance from "../axios/axiosConfig";

/**
 * Map position cho tương thích UI
 */
const POSITION_MAP = {
  top: "home_top",
  popup: "home_popup",
};

const normalizePosition = (position) => {
  if (!position) return "";
  return POSITION_MAP[position] || position;
};

/**
 * Lấy danh sách banner (seller)
 */
export const getShopBannersAPI = async (options = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      position = "",
    } = options;

    const params = {
      page,
      limit,
    };

    const normalizedPosition = normalizePosition(position);
    if (normalizedPosition) {
      params.position = normalizedPosition;
    }

    // ✅ ĐỔI TỪ admin → seller
    const res = await axiosInstance.get("/api/seller/banners", {
      params,
    });

    return res.data;
  } catch (error) {
    console.error("getShopBannersAPI error:", error.response?.data || error);
    throw error;
  }
};

/**
 * Tạo banner (seller)
 */
export const addShopBannerAPI = async (payload) => {
  const res = await axiosInstance.post(
    "/api/seller/banners",
    payload
  );
  return res.data;
};

/**
 * Cập nhật banner (seller)
 */
export const updateShopBannerAPI = async (id, payload) => {
  const res = await axiosInstance.put(
    `/api/seller/banners/${id}`,
    payload
  );
  return res.data;
};

/**
 * Xóa banner (seller)
 */
export const deleteShopBannerAPI = async (id) => {
  const res = await axiosInstance.delete(
    `/api/seller/banners/${id}`
  );
  return res.data;
};