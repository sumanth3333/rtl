"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
    const { isAuthenticated, role } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated && role) {
            router.push(`/dashboard/${role.toLowerCase()}`);
        }
    }, [isAuthenticated, role]);

    if (isAuthenticated) return <div className="flex items-center justify-center min-h-screen text-gray-600">Redirecting...</div>;

    return (
        <div className="relative flex items-center justify-center min-h-screen 
            bg-gradient-to-br from-blue-200 via-purple-100 to-gray-100 
            dark:bg-gradient-to-br dark:from-[#0f172a] dark:via-[#1e1b3a] dark:to-[#2b1e4c]">

            {/* ✅ Subtle Grid Overlay */}
            <div className="absolute inset-0 before:absolute before:inset-0 before:bg-grid-light dark:before:bg-grid-dark before:bg-opacity-10 before:bg-fixed"></div>

            {/* ✅ Login Form Directly on Background */}
            <div className="relative w-full max-w-md px-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 text-center pb-2">
                    Welcome to <span className="text-blue-800 dark:text-blue-400">EasyDoers</span>
                </h1>
                <p className="text-center text-gray-600 dark:text-gray-400 mb-10">
                    Your business operations, simplified.
                </p>

                {/* ✅ Modern Login Form */}
                <LoginForm onLoginSuccess={() => router.push("/dashboard")} />
            </div>
        </div>
    );
}
