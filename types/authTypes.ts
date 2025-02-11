export interface DecodedToken {
    sub: string; // Username
    ROLE: string; // Role from JWT
}

export interface AuthContextType {
    isAuthenticated: boolean;
    role: string | null;
    username: string | null;
    logout: () => void;
    isLoading: boolean;
    refreshAuth: () => Promise<void>; // ✅ Added refreshAuth
}
