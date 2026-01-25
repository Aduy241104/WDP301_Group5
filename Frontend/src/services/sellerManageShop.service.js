import axiosInstance from "../axios/axiosConfig";

export const getPickupAddressListAPI = async () => {
  const res = await axiosInstance.get(`/api/seller/shop/pickup-address`);
  return res.data;
};

export const getPickupAddressDetailAPI = async (pickupAddressId) => {
  const res = await axiosInstance.get(
    `/api/seller/shop/pickup-address/${pickupAddressId}`
  );
  return res.data;
};

export const addPickupAddressAPI = async (payload) => {
  const res = await axiosInstance.post(`/api/seller/shop/pickup-address`, payload);
  return res.data;
};

export const updatePickupAddressAPI = async (pickupAddressId, payload) => {
  const res = await axiosInstance.put(
    `/api/seller/shop/pickup-address/${pickupAddressId}`,
    payload
  );
  return res.data;
};

export const deletePickupAddressAPI = async (pickupAddressId) => {
  const res = await axiosInstance.delete(
    `/api/seller/shop/pickup-address/${pickupAddressId}`
  );
  return res.data;
};

export const setDefaultPickupAddressAPI = async (pickupAddressId) => {
  const res = await axiosInstance.put(
    `/api/seller/shop/pickup-address/${pickupAddressId}/set-default`
  );
  return res.data;
};


