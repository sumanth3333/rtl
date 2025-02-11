"use client"; // ✅ Required for Next.js client components

import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

export default function UnauthorizedPage() {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
            <h1 className="text-3xl font-bold text-red-600">403 - Unauthorized</h1>
            <p className="text-gray-600 mt-2">You do not have permission to access this page.</p>

            {/* ✅ Pass a function instead of a string */}
            <Button text="Go Back to Dashboard" onClick={() => router.push("/dashboard")} />
        </div>
    );
}
