import axios from "axios";
import { handleApiError } from "./errorHandler";
import { forceLogoutRedirect, refreshAccessToken } from "./apiClient";

const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

// The WhatsApp late-opening reporting service lives under a different base path (/api) than
// the rest of the backend (/v1), so it gets its own client instead of reusing apiClient.
const whatsappApiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_WHATSAPP_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
        "Timezone": userTimezone,
    },
    withCredentials: true,
});

// ✅ Same auto-refresh-and-retry apiClient has, reusing its shared in-flight refresh so a 401
// here and a 401 on apiClient at the same moment still only trigger one refresh call total.
whatsappApiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response &&
            error.response.status === 401 &&
            originalRequest &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;
            try {
                await refreshAccessToken();
                return whatsappApiClient(originalRequest);
            } catch (refreshError) {
                console.error("❌ Refresh token failed. Logging out...");
                forceLogoutRedirect();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(handleApiError(error));
    }
);

export default whatsappApiClient;
