import axios from "axios";
import { emitLogout } from "../utils/authEvents";

const API_URL = import.meta.env.VITE_API_URL;
const LS_KEY = "e-commerce";

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: { "Content-Type": "application/json" },
    // withCredentials: true, // bật nếu backend dùng cookie
});

function getToken() {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw)?.token ?? null;
    } catch {
        return null;
    }
}

// Request: gắn token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

// Response: bắt 401 => auto logout (chỉ khi có token)
axiosInstance.interceptors.response.use(
    (res) => res,
    (error) => {
        const status = error?.response?.status;
        const token = getToken();

        // Nếu có token mà vẫn 401 => token hết hạn/invalid => logout
        if (status === 403 && token) {
            emitLogout("token_expired_or_invalid");
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
