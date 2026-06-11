import { jwtDecode } from "jwt-decode";
import apiClient from "../api/apiClient";

// ✅ Login Function (Backend Handles Cookie Storage)
export const login = async (userName: string, password: string) => {
    try {
        const response = await apiClient.post("/auth/login", { userName, password });
        if (response.status === 200) {
            //console.log(response)
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
