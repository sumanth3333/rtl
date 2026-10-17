export interface DecodedToken {
    sub: string; // Username
    ROLE: string; // Role from JWT
}

// GET /v1/auth/me - role-specific, derived from the session cookie alone. Mirrors the
// shape /v1/auth/login already returns for that role, so it never needs its own parsing
// logic beyond what login's response already has.
export interface AuthenticatedUserDetails {
    loginEmail?: string;
    loginPerson?: string; // OWNER/MANAGER - the company name
    employee?: { employeeNtid: string; employeeName: string };
    store?: { dealerStoreId: string; storeName: string };
    isClockin?: string;
    clockinLocation?: string;
    isSaleSubmit?: string;
}

export interface AuthContextType {
    isAuthenticated: boolean;
    role: string | null;
    username: string | null;
    logout: () => any;
    isLoading: boolean;
    refreshAuth: () => Promise<void>; // ✅ Added refreshAuth
}
