import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { validRoles } from "./constants/validRoles";

const roleRoutePrefixes: Record<string, string[]> = {
    ADMIN: ["/dashboard/admin"],
    OWNER: ["/dashboard/owner"],
    MANAGER: ["/dashboard/manager"],
    EMPLOYEE: ["/dashboard/employee"],
};

const allProtectedPrefixes = Object.values(roleRoutePrefixes).flat();

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const base64UrlToUint8Array = (base64Url: string) => {
    // Normalize padding and replace URL-safe chars
    const padded = base64Url.padEnd(base64Url.length + ((4 - (base64Url.length % 4)) % 4), "=").replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
};

const verifyJwt = async (jwt: string, secretKey: Uint8Array) => {
    const [headerB64, payloadB64, signatureB64] = jwt.split(".");
    if (!headerB64 || !payloadB64 || !signatureB64) {
        throw new Error("Invalid JWT structure");
    }

    const data = `${headerB64}.${payloadB64}`;
    const signature = base64UrlToUint8Array(signatureB64);

    const cryptoKey = await crypto.subtle.importKey(
        "raw",
        secretKey,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["verify"]
    );

    const verified = await crypto.subtle.verify("HMAC", cryptoKey, signature, textEncoder.encode(data));
    if (!verified) {
        throw new Error("Invalid JWT signature");
    }

    const payloadJson = textDecoder.decode(base64UrlToUint8Array(payloadB64));
    return JSON.parse(payloadJson) as Record<string, unknown>;
};

const isRoleAllowedForPath = (role: string, pathname: string) => {
    // Allow non-dashboard paths configured in matcher (profile/settings) for any logged-in role
    if (pathname.startsWith("/profile") || pathname.startsWith("/settings")) { return true; }

    // Only enforce when the path matches a known role prefix
    const matchedPrefix = allProtectedPrefixes.find((prefix) => pathname.startsWith(prefix));
    if (!matchedPrefix) { return true; }

    const prefixes = roleRoutePrefixes[role];
    if (!prefixes) { return false; }
    return prefixes.some((prefix) => pathname.startsWith(prefix));
};

export async function middleware(request: NextRequest) {
    //console.log(`Inside Middleware.ts`);

    const jwt = request.cookies.get("accessToken")?.value;
    const refreshToken = request.cookies.get("refreshToken")?.value;

    if (!jwt && !refreshToken) {
        //console.log("🚨 No tokens found. Redirecting to login.");
        return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    if (!jwt && refreshToken) {
        //console.log("🔄 Access token missing, allowing frontend to refresh...");
        return NextResponse.next(); // ✅ Let Axios handle refresh
    }

    try {
        const secretEnv = process.env.JWT_SECRET || "";

        // Edge runtime-safe decoding: try base64 first, fall back to UTF-8 bytes
        const secretKey = (() => {
            try {
                const decoded = atob(secretEnv);
                return Uint8Array.from(decoded, (char) => char.charCodeAt(0));
            } catch {
                return textEncoder.encode(secretEnv);
            }
        })();

        const payload = await verifyJwt(jwt!, secretKey);
        const role = payload["ROLE"] as string;

        if (!validRoles.includes(role)) {
            return NextResponse.redirect(new URL("/unauthorized", request.url));
        }

        // Enforce role-based route access
        const path = request.nextUrl.pathname;
        if (!isRoleAllowedForPath(role, path)) {
            return NextResponse.redirect(new URL("/unauthorized", request.url));
        }

        //console.log("✅ Middleware validation passed.");
        return NextResponse.next();
    } catch (error) {
        console.error("🚨 JWT verification failed:", error);

        if (refreshToken) {
            //console.log("🔄 JWT expired but refreshToken exists. Allowing frontend to refresh...");
            return NextResponse.next(); // ✅ Let Axios handle it
        }

        const response = NextResponse.redirect(new URL("/auth/login", request.url));
        response.cookies.delete("accessToken");
        response.cookies.delete("refreshToken");
        return response;
    }
}

export const config = {
    matcher: ["/dashboard/:path*", "/profile", "/settings"],
};
