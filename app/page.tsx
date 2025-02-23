"use client";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { useRouter } from "next/navigation"; // ✅ Correct import for Next.js App Router
import { useEffect } from "react";

export default function Home() {
  const { isAuthenticated, role } = useAuth();
  const router = useRouter();

  // ✅ Redirect authenticated users to their respective dashboard
  useEffect(() => {
    if (isAuthenticated && role) {
      router.push(`/dashboard/${role.toLowerCase()}`);
    }
  }, [isAuthenticated, role, router]);

  // ✅ Prevent rendering login form if already logged in
  if (isAuthenticated) return <div>Redirecting...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gradient-to-br from-blue-100 via-blue-300 to-blue-500 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950">
      {/* ✅ Title & Welcome Message */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl md:text-6xl font-extrabold text-white text-center drop-shadow-lg"
      >
        Welcome to <span className="text-blue-900 dark:text-blue-400">RealTime Logging</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-4 text-lg md:text-xl text-white text-center max-w-xl"
      >
        A powerful platform to manage companies, stores, invoices, and payments.
      </motion.p>

      {/* ✅ Call to Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-8 flex flex-col sm:flex-row gap-4"
      >
        <Link href="/dashboard" className="px-6 py-3 text-lg font-semibold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 
                        rounded-lg shadow-lg transition-all duration-300">Go to Dashboard</Link>
        <Link href="/auth/login" className="px-6 py-3 text-lg font-semibold text-gray-900 bg-white hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 
                        rounded-lg shadow-lg transition-all duration-300">Login</Link>
      </motion.div>
    </div>
  );
}
