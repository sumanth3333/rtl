"use client";

import { createContext, useState, useEffect, ReactNode, useCallback } from "react";
import { getUser, logout as apiLogout } from "@/services/authService";
import { AuthContextType } from "@/types/authTypes";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [role, setRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // ✅ Function to fetch user data and update state
  const fetchUser = useCallback(async () => {
    console.log("🚀 Fetching user details...");
    const user = await getUser();
    console.log("✅ API Response:", user);

    if (user?.loginEmail) {
      setUsername(user.loginEmail.split("@")[0]);
      setRole(user.role);
      setIsAuthenticated(true);
      console.log("✅ State Updated:", { username: user.loginEmail, role: user.role, isAuthenticated: true });
    } else {
      setIsAuthenticated(false);
      setUsername(null);
      setRole(null);
      console.log("❌ User not authenticated. Resetting state.");
    }
    setIsLoading(false);
  }, []);

  // ✅ Automatically fetch user on mount
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // ✅ Logout Function
  const logout = async () => {
    await apiLogout();
    setIsAuthenticated(false);
    setUsername(null);
    setRole(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, username, logout, isLoading, refreshAuth: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}
