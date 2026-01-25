import axiosInstance from "../axios/axiosConfig";

export const uploadImagesAPI = async ({ files, folder = "temp" }) => {
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    form.append("folder", folder);

    const res = await axiosInstance.post("/api/upload/images", form, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
};

export const uploadSingleImageAPI = async ({ file, folder = "temp" }) => {
    const form = new FormData();
    form.append("file", file);
    form.append("folder", folder);

    const res = await axiosInstance.post("/api/upload/image", form, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
};
