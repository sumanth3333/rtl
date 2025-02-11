"use client"; // ✅ Required for Next.js client components

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function NotFoundPage() {
    const { isAuthenticated, role } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated && role) {
            router.replace(`/dashboard/${role.toLowerCase()}`); // ✅ Redirect logged-in users
        } else {
            router.replace("/auth/login"); // ✅ Redirect unauthenticated users
        }
    }, [isAuthenticated, role]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
            <h1 className="text-4xl font-bold text-red-600">404 - Page Not Found</h1>
            <p className="text-gray-600 mt-2">Oops! The page you're looking for does not exist.</p>
            <p className="text-gray-600 mt-2">Redirecting...</p>
        </div>
    );
}
