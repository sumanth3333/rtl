"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    BanknotesIcon,
    Cog6ToothIcon,
    ReceiptPercentIcon,
    ClockIcon,
    DocumentTextIcon,
    FingerPrintIcon,
} from "@heroicons/react/24/outline";

export default function PaycheckNavbar() {
    const pathname = usePathname();

    const basePath = "/dashboard/owner/paychecks";

    const navItems = [
        { name: "Generate Pay", path: `${basePath}`, icon: BanknotesIcon },
        { name: "Employee Pay Setup", path: `${basePath}/employee-pay-setup`, icon: Cog6ToothIcon },
        { name: "Company Commission", path: `${basePath}/company-commission`, icon: ReceiptPercentIcon },
        { name: "Calculate Overtime", path: `${basePath}/calculate-overtime`, icon: ClockIcon },
        { name: "View Paychecks", path: `${basePath}/view-paychecks`, icon: DocumentTextIcon },
        { name: "Clockins", path: `${basePath}/clockins`, icon: FingerPrintIcon },
    ];

    return (
        <nav className="sticky top-0 z-30 w-full border-b border-gray-200 bg-white/90 backdrop-blur-md shadow-sm dark:border-gray-800 dark:bg-gray-900/90">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
                <div className="flex items-center gap-1 overflow-x-auto py-2.5 scrollbar-hide">
                    {navItems.map((item) => {
                        const isActive = pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <Link key={item.path} href={item.path} className="shrink-0">
                                <div
                                    className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition-all
                                        ${isActive
                                            ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-sm"
                                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                                        }`}
                                >
                                    <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-gray-400 dark:text-gray-500"}`} />
                                    {item.name}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
