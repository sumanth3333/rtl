"use client";

import { createContext, useState, useEffect, ReactNode, useCallback } from "react";
import { getUser, logoutAPI } from "@/services/auth/authService";
import { AuthContextType } from "@/types/authTypes";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [role, setRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const normalizeRole = (value: unknown): string | null => {
    if (typeof value !== "string") { return null; }
    const upper = value.trim().toUpperCase();
    if (!upper) { return null; }
    return upper.startsWith("ROLE_") ? upper.replace(/^ROLE_/, "") : upper;
  };

  // ✅ Function to fetch user data and update state
  const fetchUser = useCallback(async () => {
    const user = await getUser();

    const normalizedRole = normalizeRole(user?.role);

    if (user?.loginEmail && normalizedRole) {
      setUsername(user.loginEmail.split("@")[0]);
      setRole(normalizedRole);
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      setUsername(null);
      setRole(null);
    }
    setIsLoading(false);
  }, []);

  // ✅ Automatically fetch user on mount
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // ✅ Logout Function
  const logout = async () => {
    try {
      // ✅ Call API to logout (clears HttpOnly cookie on the server)
      const response = await logoutAPI();

      if (response) {
        // ✅ Clear Local Storage & Session Storage
        localStorage.clear();
        sessionStorage.clear();

        // ✅ Clear all non-HttpOnly cookies
        document.cookie.split(";").forEach((cookie) => {
          document.cookie = cookie
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });

        // ✅ Reset Authentication State
        setIsAuthenticated(false);
        setUsername(null);
        setRole(null);
        setIsLoading(false);
      }
      return response;
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };


  return (
    <AuthContext.Provider value={{ isAuthenticated, role, username, logout, isLoading, refreshAuth: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}
