import apiClient from "./apiClient";

// ✅ Login Function (Backend Handles Cookie Storage)
export const login = async (userName: string, password: string) => {
    try {
        const response = await apiClient.post("/auth/login", { userName, password });
        if (response.status === 200) {
            console.log("✅ Login successful!");
        }
        return response;
    } catch (error) {
        console.error("🚨 Login request failed:", error);
        throw error;
    }
};

// ✅ Logout Function (Backend Clears Cookies)
export const logout = async () => {
    console.log(`🚀 Inside authService logout`);
    try {
        const response = await apiClient.post("/auth/logout");
        console.log("✅ Logout successful.");
        return response;
    } catch (error) {
        console.error("🚨 Logout request failed:", error);
        throw error;
    }
};

export const refreshToken = async () => {
    try {
        const response = await apiClient.post("/auth/refreshToken");
        console.log("✅ Token refreshed successfully");
        return response;
    } catch (error) {
        console.error("❌ Refresh token request failed:", error);
        throw error; // ✅ Ensure the interceptor correctly handles failure
    }
};


export const getUser = async () => {
    try {
        const response = await fetch("/api/auth/me", { credentials: "include" });

        if (!response.ok) {
            console.error(`🚨 API Error ${response.status}: ${response.statusText}`);
            return null;
        }

        const data = await response.json();

        // ✅ Handle cases where user is not logged in (returns null values)
        if (!data.accessToken) {
            return null;
        }

        return data;
    } catch (error) {
        console.error("🚨 Error fetching user details:", error);
        return null;
    }
};
