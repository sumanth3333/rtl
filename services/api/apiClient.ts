import axios from "axios";
import { handleApiError } from "./errorHandler";

const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_API_URL,
    headers: {
        "Content-Type": "application/json",
        "Timezone": userTimezone
    },
    withCredentials: true, // ✅ Ensures HTTP-only cookies are sent with requests
});

// ✅ Best-effort browser geolocation, requested once per page load and cached - unlike
// Timezone this can't be resolved synchronously (needs user permission), so the very first
// request(s) may go out without it. Never blocks a request and is silently omitted if
// permission is denied/unavailable - this is audit metadata only, never required.
let cachedCoords: { latitude: number; longitude: number } | null = null;
let geolocationRequested = false;

const requestGeolocationOnce = () => {
    if (geolocationRequested || typeof window === "undefined" || !navigator.geolocation) { return; }
    geolocationRequested = true;
    navigator.geolocation.getCurrentPosition(
        (position) => {
            cachedCoords = { latitude: position.coords.latitude, longitude: position.coords.longitude };
        },
        () => {
            // Permission denied/unavailable - cachedCoords stays null, headers are simply omitted.
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5 * 60 * 1000 }
    );
};

apiClient.interceptors.request.use((config) => {
    requestGeolocationOnce();
    if (cachedCoords) {
        config.headers.set("Latitude", String(cachedCoords.latitude));
        config.headers.set("Longitude", String(cachedCoords.longitude));
    }
    return config;
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
                    //console.log("✅ Token refreshed successfully.");
                    return apiClient(originalRequest); // ✅ Retry original request
                }
            } catch (refreshError) {
                console.error("❌ Refresh token failed. Logging out...");
                if (typeof window !== "undefined" && window.location.pathname !== "/auth/login") {
                    // Clear stale session data so a future load doesn't retrigger this same loop
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.href = "/auth/login"; // ✅ Redirect user to login
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(handleApiError(error));
    }
);

export default apiClient;