import axios from "axios";
import { emitLogout } from "../utils/authEvents";

const API_URL = import.meta.env.VITE_API_URL;
const LS_KEY = "e-commerce";

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
});

// axios riêng để refresh
const refreshClient = axios.create({
    baseURL: API_URL,
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
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

function setToken(token) {
    const raw = localStorage.getItem(LS_KEY);
    const data = raw ? JSON.parse(raw) : {};
    localStorage.setItem(LS_KEY, JSON.stringify({ ...data, token }));
}

axiosInstance.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

//auto refresh 
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
    failedQueue = [];
};

axiosInstance.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalRequest = error.config;
        const status = error?.response?.status;
        const token = getToken();

        // Nếu chính refresh endpoint fail => logout luôn (tránh loop)
        if (originalRequest?.url?.includes("/api/auth/refresh-token")) {
            emitLogout("refresh_failed");
            return Promise.reject(error);
        }

        // const isAuthRequest = !!originalRequest?.headers?.Authorization;

        // // Public request (không gắn Authorization) => bỏ qua auto logout/refresh
        // if (!isAuthRequest) {
        //     // emitLogout("refresh_failed");
        //     return Promise.reject(error);
        // }

        if ((status === 403) && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: (newToken) => {
                            originalRequest.headers.Authorization = `Bearer ${newToken}`;
                            resolve(axiosInstance(originalRequest));
                        },
                        reject,
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {

                // GỌI BẰNG refreshClient để không bị interceptor bắt lại
                //path nên đồng bộ với baseURL:
                const res = await refreshClient.get("/api/auth/refresh-token");
                // Nếu API_URL không có /api thì đổi thành: "/api/auth/refresh-token"

                const newAccessToken = res.data?.accessToken;
                if (!newAccessToken) throw new Error("No access token returned");

                setToken(newAccessToken);
                processQueue(null, newAccessToken);

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return axiosInstance(originalRequest);
            } catch (err) {
                processQueue(err, null);
                emitLogout("refresh_failed");
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
