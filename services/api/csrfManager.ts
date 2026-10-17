import axios from "axios";

// Bare axios instance, not apiClient - GET /auth/csrf is a safe method so apiClient's
// request interceptor would never try to attach a CSRF header to it anyway, but keeping
// this fetch independent avoids any future risk of the CSRF bootstrap depending on itself.
const csrfClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_API_URL,
    withCredentials: true,
});

interface CsrfState {
    token: string;
    headerName: string;
}

let csrfState: CsrfState | null = null;
let fetchPromise: Promise<CsrfState> | null = null;

const requestCsrfToken = async (): Promise<CsrfState> => {
    const response = await csrfClient.get("/auth/csrf");
    const { token, headerName } = response.data ?? {};
    csrfState = { token, headerName: headerName || "X-CSRF-TOKEN" };
    return csrfState;
};

// ✅ Single-flight, same reasoning as apiClient's refreshPromise - N concurrent unsafe
// requests before the first fetch resolves share one GET /auth/csrf instead of each firing
// their own.
export const getCsrfState = async (): Promise<CsrfState> => {
    if (csrfState) { return csrfState; }
    if (!fetchPromise) {
        fetchPromise = requestCsrfToken().finally(() => { fetchPromise = null; });
    }
    return fetchPromise;
};

// ✅ Call after login/logout, or when a request comes back CSRF_INVALID - forces the next
// unsafe request to fetch a fresh token instead of reusing a stale/rotated one.
export const refreshCsrfState = async (): Promise<CsrfState> => {
    csrfState = null;
    return getCsrfState();
};

// ✅ Call on logout - there's no session left to hold a token for; the next login will
// bootstrap a fresh one lazily.
export const clearCsrfState = () => {
    csrfState = null;
};

// Backend codes aren't confirmed yet (see auth handoff doc §8) - fall back to scanning the
// message/error text so this still works if `code` is absent or named differently.
export const isCsrfFailure = (data: any): boolean => {
    if (!data) { return false; }
    if (data.code === "CSRF_INVALID") { return true; }
    const text = `${data.message ?? ""} ${data.error ?? ""}`.toLowerCase();
    return text.includes("csrf");
};
