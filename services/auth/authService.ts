import { jwtDecode } from "jwt-decode";
import apiClient from "../api/apiClient";
import { clearCsrfState, refreshCsrfState } from "../api/csrfManager";
import { AuthenticatedUserDetails } from "@/types/authTypes";

// ✅ Login Function (Backend Handles Cookie Storage)
export const login = async (userName: string, password: string) => {
    try {
        // Always fetch a fresh pre-login CSRF token rather than trust whatever's cached -
        // the login page can sit open long enough for a previously-cached token to go stale
        // (e.g. the backend session behind it expiring), and a stale token here fails the
        // login request itself. apiClient's request interceptor reuses this same cached
        // value, so this doesn't cause a second GET /csrf.
        await refreshCsrfState();
        const response = await apiClient.post("/auth/login", { userName, password });
        if (response.status === 200) {
            // Session just started - the CSRF token is tied to it, so refetch now rather
            // than let the next write discover a stale one and pay for a retry round trip.
            await refreshCsrfState();
        }
        return response;
    } catch (error) {
        console.error("🚨 Login request failed:", error);
        throw error;
    }
};

// ✅ Calls API to refresh token (cookie gets updated automatically)
export const refreshToken = async () => {
    try {
        //console.log("🔄 Calling refresh token API...");
        const response = await apiClient.post("/auth/refreshToken");

        if (response.status === 200) {
            //console.log("✅ Token refreshed successfully (HttpOnly cookie updated).");
            return true;
        }

        console.warn("⚠️ Refresh token request failed.");
        return false;
    } catch (error) {
        console.error("❌ Refresh token request failed:", error);
        return false;
    }
};

// ✅ Extract user role from `accessToken` stored in HttpOnly cookie
export const getUserRoleFromToken = (): string | null => {
    try {
        const token = getAccessTokenFromCookie();
        if (!token) { return null; }

        const decoded: any = jwtDecode(token);
        return decoded?.ROLE || null;
    } catch (error) {
        console.error("❌ Error decoding token:", error);
        return null;
    }
};

// ✅ Reads `accessToken` from cookies (only accessible if NOT HttpOnly)
const getAccessTokenFromCookie = (): string | null => {
    const cookie = document.cookie.split("; ").find((row) => row.startsWith("accessToken="));
    return cookie ? cookie.split("=")[1] : null;
};

// ✅ Logout function (backend clears cookies)
export const logoutAPI = async () => {
    // console.log("🚀 Logging out...");
    try {
        const response = await apiClient.post("/auth/logout");
        // console.log("✅ Logout successful.");
        return response;
    } catch (error) {
        console.error("🚨 Logout failed:", error);
        return null;
    } finally {
        // No session left to hold a token for - the next login bootstraps a fresh one lazily.
        clearCsrfState();
    }
};

// ✅ GET /v1/auth/me - session-cookie-only, re-fetches the company/employee/store details
// that are otherwise only ever handed to us once, in the login response. Used as a fallback
// when that data isn't in localStorage (e.g. it was cleared) but the session is still valid,
// so pages relying on it don't hang forever instead of recovering.
export const fetchAuthenticatedUser = async (): Promise<AuthenticatedUserDetails | null> => {
    try {
        const response = await apiClient.get<AuthenticatedUserDetails>("/auth/me");
        return response.data ?? null;
    } catch (error) {
        console.error("❌ Failed to fetch authenticated user details:", error);
        return null;
    }
};

export const getUser = async () => {
    try {
        const response = await fetch("/api/auth/me", {
            method: "GET",
            cache: "no-store",
            credentials: "include", // ✅ Ensures cookies are sent
            headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
            console.warn(`🚨 API Error ${response.status}: ${response.statusText}`);
            if (response.status === 401) {
                return null;
            }
            return null;
        }
        const userData = await response.json();
        return userData;
    } catch (error) {
        console.error("❌ Error fetching user details:", error);
        return null;
    }
};
