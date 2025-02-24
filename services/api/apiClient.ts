import axios from "axios";
import { refreshToken } from "../auth/authService";

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_API_URL,
    headers: { "Content-Type": "application/json" },
    withCredentials: true, // ✅ Ensures cookies are sent
});

// **Attach Authorization token but SKIP login & refreshToken routes**
apiClient.interceptors.request.use(async (config) => {
    if (config.url?.includes("/auth/login") || config.url?.includes("/auth/refreshToken")) {
        return config; // ✅ Skip token check for login & refresh
    }
    let token = sessionStorage.getItem("accessToken");
    if (!token) {
        console.warn("🔄 No access token found. Attempting refresh...");
        token = await refreshToken();
    }

    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
}, (error) => Promise.reject(error));

// **Handle 401 errors by refreshing token before retrying**
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url.includes("/auth/login") &&
            !originalRequest.url.includes("/auth/refreshToken")
        ) {
            console.warn("🔄 Token expired. Refreshing...");
            originalRequest._retry = true;

            const newToken = await refreshToken();

            if (newToken) {
                originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
                return apiClient(originalRequest); // ✅ Retry request
            }

            console.error("❌ Refresh token failed. Logging out...");
            window.location.href = "/auth/login"; // ✅ Redirect to login
        }

        return Promise.reject(error);
    }
);

export default apiClient;
