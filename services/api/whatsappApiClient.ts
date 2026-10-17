import axios from "axios";
import { handleApiError } from "./errorHandler";
import { forceLogoutRedirect, refreshAccessToken } from "./apiClient";
import { getCsrfState, isCsrfFailure, refreshCsrfState } from "./csrfManager";

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

const CSRF_PROTECTED_METHODS = new Set(["post", "put", "patch", "delete"]);

whatsappApiClient.interceptors.request.use(async (config) => {
    const method = config.method?.toLowerCase();
    if (method && CSRF_PROTECTED_METHODS.has(method)) {
        const { token, headerName } = await getCsrfState();
        config.headers.set(headerName, token);
    }
    return config;
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

        // ✅ Already refreshed once for this request and it's still 401 - session isn't
        // recoverable, same reasoning as apiClient.
        if (error.response && error.response.status === 401 && originalRequest?._retry) {
            forceLogoutRedirect();
        }

        if (
            error.response &&
            error.response.status === 403 &&
            isCsrfFailure(error.response.data) &&
            originalRequest &&
            !originalRequest._csrfRetry
        ) {
            originalRequest._csrfRetry = true;
            try {
                await refreshCsrfState();
                return whatsappApiClient(originalRequest);
            } catch {
                // Couldn't refetch a CSRF token - fall through to the generic error below.
            }
        }

        return Promise.reject(handleApiError(error));
    }
);

export default whatsappApiClient;
