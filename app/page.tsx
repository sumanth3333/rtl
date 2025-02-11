"use client";

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
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        Welcome to Business Management Home Page
        <p>Please{" "}
          <Link href="/auth/login" className="text-blue-700">Login </Link>
          to access the dashboard
        </p>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        By Easydoers
      </footer>
    </div>
  );
}
