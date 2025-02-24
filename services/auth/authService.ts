import { jwtDecode } from "jwt-decode";
import apiClient from "../api/apiClient";
import axios from "axios";
import Cookies from "js-cookie";

export const login = async (userName: string, password: string) => {
    try {
        console.log("🔑 Logging in...");
        const response = await apiClient.post("/auth/login", { userName, password });

        if (response.status === 200) {
            const authHeader = response.headers["authorization"];
            if (authHeader) {
                const accessToken = authHeader.split(" ")[1];

                // ✅ Store accessToken in a cookie (Middleware can read it)
                Cookies.set("accessToken", accessToken, { expires: 1, secure: true, sameSite: "Lax" });

                console.log("✅ Login successful, token stored.");
            }
        }

        // window.location.href = "/dashboard"; // ✅ Redirect after login
        return response;

    } catch (error) {
        console.error("🚨 Login request failed:", error);
        throw error;
    }
};

export const refreshToken = async () => {
    try {
        console.log("🔄 Calling refresh token API...");

        // ✅ Use separate axios instance to prevent recursion
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BASE_API_URL}/auth/refreshToken`,
            {},
            { withCredentials: true } // ✅ Ensures refreshToken cookie is sent
        );

        if (response.status === 200) {
            const newAccessToken = response.headers["authorization"]?.split(" ")[1];

            if (newAccessToken) {
                // ✅ Store in sessionStorage for frontend use
                sessionStorage.setItem("accessToken", newAccessToken);
                // ✅ Store in cookies for middleware use
                Cookies.set("accessToken", newAccessToken, { expires: 1, secure: true, sameSite: "Lax" });

                console.log("✅ Token refreshed and stored in cookies.");
                return newAccessToken;
            }

            console.warn("⚠️ No new accessToken found in response headers.");
            return null;
        }

        console.warn("⚠️ Refresh token request failed.");
        return null;
    } catch (error) {
        console.error("❌ Refresh token request failed:", error);
        return null;
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
export const logout = async () => {
    console.log("🚀 Logging out...");
    try {
        const response = await apiClient.post("/auth/logout");
        console.log("✅ Logout successful.");
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
