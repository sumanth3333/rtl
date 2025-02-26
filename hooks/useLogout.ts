import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useOwner } from "./useOwner";
import { useEmployee } from "./useEmployee";

export function useLogout() {
    const router = useRouter();
    const { logout } = useAuth(); // ✅ Get logout from context
    const { clearOwnerData } = useOwner();
    const { clearEmployeeData } = useEmployee()

    return async () => {
        try {
            console.log("🚀 Logging out...");
            const response = await logout(); // ✅ Clear user state in AuthContext
            if (response && response.status === 200) {
                clearOwnerData();
                clearEmployeeData();
                console.log("✅ Logout successful. Redirecting...");
                router.push("/auth/login"); // ✅ Redirect after logout
            }
        } catch (error) {
            console.error("🚨 Logout failed:", error);
        }
    };
}
