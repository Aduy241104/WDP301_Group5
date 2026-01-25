import axiosInstance from "../axios/axiosConfig";

export const getAddressListAPI = async () => {
    const res = await axiosInstance.get("/api/profile/addresses");
    return res.data.data; // CHỈ trả mảng address
};


export const addAddressAPI = async (data) => {
    const res = await axiosInstance.post("/api/profile/addresses", data);
    return res.data;
};

export const updateAddressAPI = async (addressId, data) => {
    const res = await axiosInstance.put(`/api/profile/addresses/${addressId}`, data);
    return res.data;
};
