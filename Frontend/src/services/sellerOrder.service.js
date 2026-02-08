import axiosInstance from "../axios/axiosConfig";

export const getSellerOrdersAPI = async (params) => {
    const res = await axiosInstance.get(`/api/seller/orders`, {
        params,
    });
    return res.data;
};

export const getSellerOrderDetailAPI = async (id) => {
    const res = await axiosInstance.get(`/api/seller/orders/${id}`);
    return res.data;
};

export const confirmSellerOrderAPI = async (id) => {
    const res = await axiosInstance.patch(
        `/api/seller/orders/${id}/confirm`
    );
    return res.data;
};

export const cancelSellerOrderAPI = async (id) => {
    const res = await axiosInstance.patch(
        `/api/seller/orders/${id}/cancel`
    );
    return res.data;
};

export const updateSellerOrderStatusAPI = async ({
    id,
    status,
    trackingCode,
    pickupAddressId,
}) => {
    const res = await axiosInstance.patch(
        `/api/seller/orders/${id}/status`,
        {
            status,
            trackingCode,
            pickupAddressId,
        }
    );
    return res.data;
};

export const getOrderPickupAddressesAPI = async (id) => {
    const res = await axiosInstance.get(`/api/seller/orders/${id}/pickup-addresses`);
    return res.data;
};

export const getDashboardStatsAPI = async () => {
  const res = await axiosInstance.get(
    `/api/seller/orders/dashboard/stats`
  );
  return res.data;
};
