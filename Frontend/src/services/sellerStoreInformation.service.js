import axiosInstance from "../axios/axiosConfig";

export const getStoreInformationAPI = async () => {
  const res = await axiosInstance.get(`/api/seller/information`);
  return res.data;
};

export const updateStoreInformationAPI = async (payload, file) => {
  // if an avatar file is provided, send multipart/form-data
  if (file) {
    const form = new FormData();
    form.append("avatar", file);
    if (payload.name !== undefined) form.append("name", payload.name);
    if (payload.description !== undefined) form.append("description", payload.description);
    if (payload.contactPhone !== undefined) form.append("contactPhone", payload.contactPhone);
    // do not append payload.avatar when we already have a file
    if (!file && payload.avatar !== undefined) form.append("avatar", payload.avatar);
    // shopAddress: append as JSON so backend can parse it
    if (payload.shopAddress) {
      form.append("shopAddress", JSON.stringify(payload.shopAddress));
    }

    const res = await axiosInstance.put(`/api/seller/information`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  }

  const res = await axiosInstance.put(`/api/seller/information`, payload);
  return res.data;
};
