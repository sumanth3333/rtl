"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PaycheckNavbar() {
    const pathname = usePathname();

    // ✅ Extract base path dynamically (Keeps `/dashboard/owner/paychecks` intact)
    const basePath = pathname.includes("/dashboard/owner/paychecks")
        ? "/dashboard/owner/paychecks"
        : "/paychecks"; // Fallback in case of direct access

    return (
        <nav className="relative top-0 left-0 w-full bg-white dark:bg-gray-900 shadow-md z-50 border-b border-gray-300 dark:border-gray-700">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-3 flex items-center justify-center gap-4 overflow-x-auto scrollbar-hide">
                {[
                    { name: "Generate Pay", path: `${basePath}/generate-pay` },
                    { name: "Employee Pay Setup", path: `${basePath}/employee-pay-setup` },
                    { name: "Company Commission", path: `${basePath}/company-commission` },
                ].map((item) => (
                    <Link key={item.path} href={item.path}>
                        <div
                            className={`px-4 py-2 text-sm sm:text-base font-semibold rounded-lg transition-all cursor-pointer 
                                ${pathname === item.path
                                    ? "bg-blue-600 text-white shadow-md scale-105"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                                }`}
                        >
                            {item.name}
                        </div>
                    </Link>
                ))}
            </div>
        </nav>
    );
}
