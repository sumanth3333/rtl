import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";
import { NextResponse } from "next/server";

const normalizeRole = (value: unknown): string | null => {
    if (typeof value !== "string") { return null; }
    const upper = value.trim().toUpperCase();
    if (!upper) { return null; }
    return upper.startsWith("ROLE_") ? upper.replace(/^ROLE_/, "") : upper;
};

export async function GET() {
    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get("accessToken")?.value || null;

        if (!accessToken) {
            return NextResponse.json({ loginEmail: null, role: null, accessToken: null }); // ✅ Graceful response instead of 401
        }

        try {
            const decodedToken: { sub?: string; ROLE?: string; role?: string } = jwtDecode(accessToken);
            const role = normalizeRole(decodedToken.ROLE ?? decodedToken.role);

            return NextResponse.json({
                loginEmail: decodedToken.sub ?? null, // ✅ Extracted from JWT
                role, // ✅ normalized role (OWNER/ADMIN/EMPLOYEE/MANAGER)
                accessToken, // ✅ Include token if needed for further API calls
            });
        } catch (error) {
            return NextResponse.json({ loginEmail: null, role: null, accessToken: null }); // ✅ Return null instead of 401
        }
    } catch (error) {
        console.error("🚨 Error retrieving user session:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
