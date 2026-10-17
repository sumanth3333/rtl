import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ✅ This used to verify a JWT read from `accessToken`/`refreshToken` cookies here, but the
// backend issues those as `__Host-accessToken`/`__Host-refreshToken` (see the Set-Cookie on
// POST /auth/login). A `__Host-` prefixed cookie is host-locked by the browser to the exact
// origin that set it (api.easydoers.com) and can never be sent to a request on this app's own
// origin (oneclick.easydoers.com), no matter what name this code looks for - so the old check
// here always saw `jwt`/`refreshToken` as undefined and redirected every single dashboard
// navigation straight back to /auth/login, producing an infinite "Redirecting..." loop between
// the two pages (worse/more visible on slower networks and devices, which is why it mostly
// surfaced as a tablet-specific bug even though it was universal).
//
// Real authentication/authorization already happens on every request to the backend API, which
// *can* read its own host-locked cookie. On the frontend, contexts/AuthContext.tsx already
// redirects an unauthenticated session away from these same protected routes (forceLogoutRedirect,
// triggered off a failed GET /v1/auth/me) - so this middleware doesn't need to duplicate that
// check with a cookie it structurally can never see.
export async function middleware(_request: NextRequest) {
    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/profile", "/settings", "/store-deletion/:path*"],
};
