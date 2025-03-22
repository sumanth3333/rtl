"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";
import { Role, upgradeNavbarLinks } from "@/config/roleConfig";

export default function UpgradesNavBar() {
    const { role } = useAuth();
    const pathname = usePathname();
    const typedRole = role as Role;
    return (
        <nav className="relative w-full bg-white dark:bg-gray-900 shadow-md">
            <div className="max-w-7xl mx-auto px-2">
                <ul className="flex justify-center space-x-2 py-3 overflow-x-auto scrollbar-hide">
                    {upgradeNavbarLinks[typedRole]?.map((link) => (
                        <li key={link.path}>
                            <Link href={link.path} className="block">
                                <div className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300
                                    ${pathname === link.path
                                        ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg scale-105"
                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                    }`}
                                >
                                    {/* ✅ Icon is Always Visible */}
                                    <link.icon className="w-6 h-6 text-gray-700 dark:text-gray-300" />

                                    {/* ✅ Text is Hidden on Small Screens */}
                                    <span className="hidden sm:block">{link.name}</span>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
}
