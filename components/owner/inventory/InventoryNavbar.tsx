"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function InventoryNavbar() {
    const pathname = usePathname();

    const navItems = [
        { name: "Current Inventory", href: "/dashboard/owner/inventory" },
        { name: "Min. Quantity Setup", href: "/dashboard/owner/inventory/min-setup" },
        { name: "Reorder Inventory", href: "/dashboard/owner/inventory/reorder" },
        { name: "dealer specific prices", href: "/dashboard/owner/inventory/dealer-prices" },
    ];

    return (
        <nav className="bg-white dark:bg-gray-800 shadow-md">
            <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap gap-2 justify-center md:justify-between items-center">
                {/* Title */}
                <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white whitespace-nowrap">
                    📦 Inventory
                </h1>

                {/* Navigation Items */}
                <div className="flex flex-wrap justify-center md:justify-end gap-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`px-3 py-2 text-sm font-medium rounded-md transition ${pathname === item.href
                                ? "bg-blue-600 text-white"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                }`}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
}
