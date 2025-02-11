import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export function useLogout() {
    const router = useRouter();
    const { logout } = useAuth(); // ✅ Get logout from context

    return async () => {
        try {
            console.log("🚀 Logging out...");
            await logout(); // ✅ Clear user state in AuthContext

            console.log("✅ Logout successful. Redirecting...");
            router.push("/auth/login"); // ✅ Redirect after logout
        } catch (error) {
            console.error("🚨 Logout failed:", error);
        }
    };
}
