"use client";

import SidebarItem from "@/components/ui/sidebar/SidebarItem";
import SidebarHeader from "@/components/ui/sidebar/SidebarHeader";
import SidebarFooter from "@/components/ui/sidebar/SidebarFooter"; // ✅ Import Sidebar Footer
import { sidebarLinks, Role } from "@/config/roleConfig";
import { useAuth } from "@/hooks/useAuth";

export default function Sidebar({
    isCollapsed,
    setIsCollapsed,
    isMobile, // ✅ Added prop
}: {
    isCollapsed: boolean;
    setIsCollapsed: (value: boolean) => void;
    isMobile: boolean;
}) {
    const { role } = useAuth();
    console.log(`Role in sidebar: ${role}`);

    if (!role) {return <div className="text-gray-600 dark:text-gray-300 p-4">Loading...</div>;}
    const typedRole = role as Role;

    return (
        <>
            {/* ✅ Sidebar - Hidden when collapsed on mobile */}
            <aside
                className={`h-screen flex flex-col justify-between overflow-hidden transition-transform duration-300 ease-in-out z-50
                    ${isMobile ? (isCollapsed ? "hidden" : "fixed top-0 left-0 w-64 transform translate-x-0")
                        : isCollapsed ? "w-16 sm:flex hidden" : "w-64 sm:flex"}
                    bg-gradient-to-b from-gray-100 via-gray-200 to-gray-300 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700
                    border-r border-gray-300 dark:border-gray-700 shadow-xl`}
            >
                {/* Sidebar Header */}
                <SidebarHeader isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

                {/* Sidebar Links */}
                <nav className="flex flex-col space-y-2 mt-4 flex-1">
                    {sidebarLinks[typedRole]?.map((link) => (
                        <SidebarItem
                            key={link.path}
                            name={link.name}
                            path={link.path}
                            icon={link.icon}
                            isCollapsed={isCollapsed}
                        />
                    ))}
                </nav>

                {/* ✅ Sidebar Footer (Clock-In Button) */}
                <SidebarFooter isCollapsed={isCollapsed} />
            </aside>

            {/* ✅ Overlay - Click to Collapse Sidebar on Mobile */}
            {isMobile && !isCollapsed && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-md z-40"
                    onClick={() => setIsCollapsed(true)} // ✅ Click outside to close sidebar
                ></div>
            )}
        </>
    );
}
