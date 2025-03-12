"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function InventoryNavbar() {
    const pathname = usePathname();

    const navItems = [
        { name: "Current Inventory", href: "/dashboard/owner/inventory" },
        { name: "Min. Quantity Setup", href: "/dashboard/owner/inventory/min-setup" },
        { name: "Reorder Inventory", href: "/dashboard/owner/inventory/reorder" },
    ];

    return (
        <nav className="bg-white dark:bg-gray-800 shadow-md">
            <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
                <h1 className="text-xl font-bold">📦 Inventory Management</h1>
                <div className="flex space-x-6">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`px-3 py-2 rounded-lg text-sm font-medium ${pathname === item.href
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
