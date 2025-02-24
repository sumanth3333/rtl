import axios from "axios";
import { handleApiError } from "./errorHandler";

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // ✅ Ensures HTTP-only cookies are sent with requests
});

// **Response Interceptor with Auto Token Refresh & Retry**
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // **Handle 401 Unauthorized & Refresh Token**
        if (
            error.response &&
            error.response.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url.includes("/auth/refreshToken")
        ) {
            console.warn("🔄 401 Unauthorized! Attempting token refresh...");
            originalRequest._retry = true;
            try {
                const success = await apiClient.post("/auth/refreshToken"); // ✅ Backend should set new cookie
                if (success) {
                    console.log("✅ Token refreshed successfully.");
                    return apiClient(originalRequest); // ✅ Retry original request
                }
            } catch (refreshError) {
                console.error("❌ Refresh token failed. Logging out...");
                if (typeof window !== "undefined") {
                    window.location.href = "/auth/login"; // ✅ Redirect user to login
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(handleApiError(error));
    }
);

export default apiClient;