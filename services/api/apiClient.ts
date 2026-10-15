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

// ✅ Module-level, so it's shared across every axios instance (apiClient, whatsappApiClient,
// ...) - N concurrent 401s, even across different instances, await this same in-flight
// refresh instead of each firing its own POST /auth/refreshToken. Without this, a page that
// fires several requests at once at the moment the token expires sends one refresh call per
// request - and if the backend rotates/invalidates the refresh token on use, only the first
// of those actually succeeds while the rest get treated as "refresh failed" and force a logout
// despite the user having a perfectly valid session.
let refreshPromise: Promise<unknown> | null = null;

export const refreshAccessToken = (): Promise<unknown> => {
    if (!refreshPromise) {
        refreshPromise = apiClient
            .post("/auth/refreshToken") // ✅ Backend sets the new cookie
            .finally(() => {
                refreshPromise = null;
            });
    }
    return refreshPromise;
};

// ✅ Same recovery action every client takes when refresh itself fails - stale local state
// would otherwise retrigger this same loop on the next page load.
export const forceLogoutRedirect = () => {
    if (typeof window === "undefined" || window.location.pathname === "/auth/login") { return; }
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/auth/login";
};

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
                await refreshAccessToken();
                return apiClient(originalRequest); // ✅ Retry original request
            } catch (refreshError) {
                console.error("❌ Refresh token failed. Logging out...");
                forceLogoutRedirect();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(handleApiError(error));
    }
);

export default apiClient;