import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { validRoles } from "./constants/validRoles";

export async function middleware(request: NextRequest) {
    console.log(`Inside Middleware.ts`);
    // ✅ Debugging cookies
    console.log("🔍 Request Headers:", request.headers.get("cookie"));
    const jwt = request.cookies.get("accessToken")?.value;
    const refreshToken = request.cookies.get("refreshToken")?.value;

    if (!jwt && !refreshToken) {
        console.log("🚨 No tokens found. Redirecting to login.");
        return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    if (!jwt && refreshToken) {
        console.log("🔄 Access token missing, allowing frontend to refresh...");
        return NextResponse.next(); // ✅ Let Axios handle refresh
    }

    try {
        const secretKey = Buffer.from(process.env.JWT_SECRET || "", "base64");
        const { payload } = await jwtVerify(jwt!, secretKey);
        const role = payload["ROLE"] as string;

        if (!validRoles.includes(role)) {
            return NextResponse.redirect(new URL("/unauthorized", request.url));
        }

        console.log("✅ Middleware validation passed.");
        return NextResponse.next();
    } catch (error) {
        console.error("🚨 JWT verification failed:", error);

        if (refreshToken) {
            console.log("🔄 JWT expired but refreshToken exists. Allowing frontend to refresh...");
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
