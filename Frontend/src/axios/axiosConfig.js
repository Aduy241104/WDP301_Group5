import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true, // gửi cookie tự động
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor: gắn access token từ localStorage
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: tự động refresh token khi 401
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Nếu 401 và chưa retry
        if (error.response?.status === 403 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Gọi API refresh token
                const res = await axios.post(
                    `${API_URL}/api/auth/refresh`,
                    {}, // body trống, cookie gửi tự động
                    { withCredentials: true }
                );

                // Lưu access token mới
                const newAccessToken = res.data.accessToken;
                localStorage.setItem("accessToken", newAccessToken);

                // Retry request gốc với token mới
                originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
                return axiosInstance(originalRequest);

            } catch (refreshError) {
                // Nếu refresh token hết hạn → logout user
                localStorage.removeItem("accessToken");
                // redirect về login hoặc xử lý khác
                window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
