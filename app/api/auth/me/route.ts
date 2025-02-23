import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get("accessToken")?.value || null;

        if (!accessToken) {
            return NextResponse.json({ loginEmail: null, role: null, accessToken: null }); // ✅ Graceful response instead of 401
        }

        try {
            const decodedToken: { sub: string; ROLE: string } = jwtDecode(accessToken);

            return NextResponse.json({
                loginEmail: decodedToken.sub, // ✅ Extracted from JWT
                role: decodedToken.ROLE, // ✅ Extracted from JWT
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
