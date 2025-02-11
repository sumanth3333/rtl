import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
    console.log(`Inside Middleware.ts`);

    const jwt = request.cookies.get("accessToken")?.value;
    console.log(`Extracted accessToken: ${jwt}`);

    if (!jwt) {
        console.log("🚨 No JWT found, redirecting to /auth/login");
        return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    try {
        console.log(`JWT SECRET (Base64 Encoded) - ${process.env.JWT_SECRET}`);

        // ✅ Decode Base64 JWT Secret (Match Backend)
        const secretKey = Buffer.from(process.env.JWT_SECRET || "", "base64"); // ✅ Properly decode secret

        // ✅ Verify JWT using the decoded secret key
        const { payload } = await jwtVerify(jwt, secretKey);

        console.log(`Decoded Payload:`, payload);
        const role = payload["ROLE"] as string;
        console.log(`Extracted Role: ${role}`);

        const validRoles = ["ADMIN", "EMPLOYEE", "MANAGER", "OWNER"];
        if (!validRoles.includes(role)) {
            console.log("🚨 Invalid role found, redirecting to /unauthorized");
            return NextResponse.redirect(new URL("/unauthorized", request.url));
        }

        const expectedDashboardPath = `/dashboard/${role.toLowerCase()}`;
        const currentPath = request.nextUrl.pathname;
        console.log(`Current path - ${currentPath}`)
        if (!currentPath.startsWith(expectedDashboardPath)) {
            console.log(`🚨 Wrong dashboard path! Redirecting to ${expectedDashboardPath}`);
            return NextResponse.redirect(new URL(expectedDashboardPath, request.url));
        }

        console.log("✅ Middleware validation passed. Proceeding to requested page.");
        return NextResponse.next();
    } catch (error) {
        console.error("🚨 JWT verification failed:", error);
        const response = NextResponse.redirect(new URL("/auth/login", request.url));
        response.cookies.delete("accessToken");
        return response;
    }
}

export const config = {
    matcher: ["/dashboard/:path*", "/profile", "/settings"],
};
