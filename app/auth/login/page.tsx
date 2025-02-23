"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import LoginForm from "@/components/auth/LoginForm";
import { motion } from "framer-motion";

export default function LoginPage() {
    const { isAuthenticated, role } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated && role) {
            router.push(`/dashboard/${role.toLowerCase()}`);
        }
    }, [isAuthenticated, role, router]);

    if (isAuthenticated)
        return <div className="flex items-center justify-center min-h-screen text-gray-600 dark:text-gray-400">Redirecting...</div>;

    return (
        <div className="relative flex items-center justify-center min-h-screen px-6 md:px-12 
            bg-gradient-to-br from-[#E3F2FD] via-[#BBDEFB] to-[#90CAF9] 
            dark:from-[#0F172A] dark:via-[#1E293B] dark:to-[#334155]">

            {/* ✅ Subtle Business Grid Overlay */}
            <div className="absolute inset-0 before:absolute before:inset-0 before:bg-grid-light dark:before:bg-grid-dark before:bg-opacity-10 before:bg-fixed"></div>

            {/* ✅ Login Form Container with Premium UI */}
            <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.2 } }
                }}
                className="relative w-full max-w-md p-10 bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl rounded-3xl 
                    shadow-xl border border-white/20 dark:border-gray-700/50 transform transition-all duration-300 hover:shadow-2xl"
            >
                {/* ✅ Title & Description */}
                <motion.h1
                    variants={{ hidden: { opacity: 0, y: -10 }, visible: { opacity: 1, y: 0 } }}
                    className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white text-center drop-shadow-lg"
                >
                    Welcome to <span className="text-blue-900 dark:text-blue-300">EasyDoers</span>
                </motion.h1>

                <motion.p
                    variants={{ hidden: { opacity: 0, y: 5 }, visible: { opacity: 1, y: 0 } }}
                    className="text-center text-gray-700 dark:text-gray-400 mt-2 text-sm md:text-base"
                >
                    Your business operations, simplified.
                </motion.p>

                {/* ✅ Modern Login Form */}
                <motion.div
                    variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                    className="mt-8"
                >
                    <LoginForm onLoginSuccess={() => router.push("/dashboard")} />
                </motion.div>

                {/* ✅ Subtle Footer Branding */}
                <motion.p
                    variants={{ hidden: { opacity: 0, y: 5 }, visible: { opacity: 1, y: 0 } }}
                    className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6"
                >
                    Powered by <span className="font-semibold text-blue-700 dark:text-blue-300">EasyDoers Inc.</span>
                </motion.p>
            </motion.div>
        </div>
    );
}
