import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardMain() {
    const cookieStore = await cookies(); // ✅ Await the promise
    const role = cookieStore.get("role")?.value;

    // ✅ Redirect to the correct role-based dashboard
    switch (role) {
        case "admin":
            redirect("/dashboard/admin");
            break;
        case "employee":
            redirect("/dashboard/employee");
            break;
        case "manager":
            redirect("/dashboard/manager");
            break;
        case "owner":
            redirect("/dashboard/owner");
            break;
        default:
            redirect("/auth/login"); // ✅ Redirect unauthenticated users
    }

    return null; // ✅ Ensures nothing renders
}
