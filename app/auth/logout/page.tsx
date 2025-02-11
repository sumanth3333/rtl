"use client"; // ✅ Required for Next.js client components

import { useLogout } from "@/hooks/useLogout";

export default function Logout() {
    const logout = useLogout(); // ✅ Use the custom hook at the top

    return (
        <button onClick={logout} className="text-red-500 hover:text-red-700">
            Logout
        </button>
    );
}
