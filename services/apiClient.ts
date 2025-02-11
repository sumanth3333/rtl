import axios from "axios";
import { refreshToken } from "./authService"; // ✅ Import refreshToken
import Cookies from "js-cookie"; // ✅ For removing cookies on logout

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_API_URL, // ✅ API URL from environment variables
    withCredentials: true, // ✅ Automatically send cookies
});

// ✅ Response Interceptor for Handling Expired Token
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        console.log("🚨 API Client Error:", error);
        const originalRequest = error.config;

        if (
            error.response &&
            error.response.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url.includes("/auth/refreshToken")
        ) {
            originalRequest._retry = true;

            try {
                console.log("🔄 Attempting to refresh token...");
                await refreshToken();
                return apiClient(originalRequest); // ✅ Retry original request after refresh
            } catch (refreshError) {
                console.error("❌ Refresh token failed:", refreshError);

                // ✅ Clear authentication cookies
                Cookies.remove("accessToken");
                Cookies.remove("role");

                // ✅ Redirect to login page
                if (typeof window !== "undefined") {
                    window.location.href = "/auth/login"; // ✅ Force full-page reload
                }

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
