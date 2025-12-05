"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PaycheckNavbar() {
    const pathname = usePathname();

    const basePath = pathname.includes("/dashboard/owner/paychecks")
        ? "/dashboard/owner/paychecks"
        : "/paychecks";

    return (
        <nav className="relative w-full bg-white dark:bg-gray-900 shadow-md border-b border-gray-300 dark:border-gray-700">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-2 flex items-center justify-center overflow-x-auto scrollbar-hide">
                {[
                    { name: "Generate Pay", path: `${basePath}` },
                    { name: "Employee Pay Setup", path: `${basePath}/employee-pay-setup` },
                    { name: "Company Commission", path: `${basePath}/company-commission` },
                    { name: "Calculate Overtime", path: `${basePath}/calculate-overtime` },
                    { name: "View Paychecks", path: `${basePath}/view-paychecks` }

                ].map((item) => (
                    <Link key={item.path} href={item.path}>
                        <div
                            className={`px-3 py-2 text-sm sm:text-base font-semibold whitespace-nowrap rounded-lg transition-all cursor-pointer flex items-center justify-center 
                                ${pathname === item.path
                                    ? "bg-blue-600 text-white shadow-md"
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
