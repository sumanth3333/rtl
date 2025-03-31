import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardMain() {
    const cookieStore = await cookies(); // ✅ Await the promise
    const role = cookieStore.get("role")?.value;

    //console.log(role);
    // ✅ Redirect to the correct role-based dashboard
    switch (role) {
        case "admin":
            redirect("/dashboard/admin");
        case "employee":
            redirect("/dashboard/employee");
        case "manager":
            redirect("/dashboard/manager");
        case "owner":
            redirect("/dashboard/owner");
        default:
            redirect("/auth/login"); // ✅ Redirect unauthenticated users
    }

}
