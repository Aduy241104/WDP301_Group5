import axiosInstance from "../axios/axiosConfig";

export const getProfileAPI = async () => {
  const res = await axiosInstance.get("/api/profile");

  console.log("RAW RESPONSE:", res.data); // DEBUG

  return res.data.data; // ✅ CHỈ TRẢ USER
};



export const updateProfileAPI = async (data) => {
  const res = await axiosInstance.put("/api/profile", data);
  return res.data.data; // hoặc res.data tùy backend
};


export const changePasswordAPI = async (data) => {
  return axiosInstance.put("/api/profile/change-password", data);
};
