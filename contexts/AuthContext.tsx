"use client";

import { createContext, useState, useEffect, ReactNode, useCallback } from "react";
import { getUser, logoutAPI, refreshToken } from "@/services/auth/authService";
import { AuthContextType } from "@/types/authTypes";
import { AUTH_BROADCAST_CHANNEL, AUTH_SYNC_EVENT_KEY, AuthSyncEventType } from "@/constants/authSync";

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

  const emitAuthEvent = (type: AuthSyncEventType) => {
    if (typeof window === "undefined") { return; }

    const payload = JSON.stringify({ type, at: Date.now() });

    try {
      localStorage.setItem(AUTH_SYNC_EVENT_KEY, payload);
    } catch {
      // no-op
    }

    try {
      if ("BroadcastChannel" in window) {
        const channel = new BroadcastChannel(AUTH_BROADCAST_CHANNEL);
        channel.postMessage({ type, at: Date.now() });
        channel.close();
      }
    } catch {
      // no-op
    }
  };

  const clearAuthState = useCallback(() => {
    setIsAuthenticated(false);
    setUsername(null);
    setRole(null);
    setIsLoading(false);
  }, []);

  // ✅ Function to fetch user data and update state
  const fetchUser = useCallback(async () => {
    let user = await getUser();
    let normalizedRole = normalizeRole(user?.role);

    // New tabs can have only refresh token available; restore access token once and retry.
    if (!user?.loginEmail || !normalizedRole) {
      const refreshed = await refreshToken();
      if (refreshed) {
        user = await getUser();
        normalizedRole = normalizeRole(user?.role);
      }
    }

    if (user?.loginEmail && normalizedRole) {
      setUsername(user.loginEmail.split("@")[0]);
      setRole(normalizedRole);
      setIsAuthenticated(true);
      setIsLoading(false);
    } else {
      clearAuthState();
    }
  }, [clearAuthState]);

  // ✅ Automatically fetch user on mount
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (typeof window === "undefined") { return; }

    const handleAuthEvent = (eventType: AuthSyncEventType) => {
      if (eventType === "logout") {
        clearAuthState();
        return;
      }
      fetchUser();
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key !== AUTH_SYNC_EVENT_KEY || !event.newValue) { return; }
      try {
        const parsed = JSON.parse(event.newValue) as { type?: AuthSyncEventType };
        if (!parsed.type) { return; }
        handleAuthEvent(parsed.type);
      } catch {
        // no-op
      }
    };

    window.addEventListener("storage", onStorage);

    let channel: BroadcastChannel | null = null;
    if ("BroadcastChannel" in window) {
      channel = new BroadcastChannel(AUTH_BROADCAST_CHANNEL);
      channel.onmessage = (message: MessageEvent<{ type?: AuthSyncEventType }>) => {
        const eventType = message.data?.type;
        if (!eventType) { return; }
        handleAuthEvent(eventType);
      };
    }

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchUser();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisibility);
      channel?.close();
    };
  }, [clearAuthState, fetchUser]);

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
        clearAuthState();
        emitAuthEvent("logout");
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
