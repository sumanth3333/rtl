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
            //console.log("🚀 Logging out...");
            const response = await logout(); // ✅ Clear user state in AuthContext
            // logoutAPI() only ever returns a response on a successful (2xx) call - axios
            // throws otherwise - so any truthy response means success. Checking a specific
            // status here is what broke this: the backend returns 204 No Content, not 200.
            if (response) {
                clearOwnerData();
                clearEmployeeData();
                //console.log("✅ Logout successful. Redirecting...");
                router.push("/auth/login"); // ✅ Redirect after logout
            }
        } catch (error) {
            console.error("🚨 Logout failed:", error);
        }
    };
}
