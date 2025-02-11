"use client";

import { useState, useEffect } from "react";
import SidebarItem from "@/components/ui/SidebarItem";
import SidebarHeader from "@/components/ui/SidebarHeader";
import { sidebarLinks, Role } from "@/config/roleConfig";
import { useAuth } from "@/hooks/useAuth";

export default function Sidebar({
    isCollapsed,
    setIsCollapsed,
}: {
    isCollapsed: boolean;
    setIsCollapsed: (value: boolean) => void;
}) {
    const { role, username } = useAuth();
    const [isMobile, setIsMobile] = useState(typeof window !== "undefined" && window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth >= 768) {
                setIsCollapsed(false); // Always expanded on large screens
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [setIsCollapsed]);

    if (!role) return <div className="text-gray-600 dark:text-gray-300 p-4">Loading...</div>;
    const typedRole = role as Role;

    return (
        <>
            {/* ✅ Sidebar (Fixed Only When Expanded on Mobile) */}
            <aside
                className={`h-screen flex flex-col overflow-hidden transition-all duration-300 ease-in-out z-50
                    ${isMobile && !isCollapsed ? "fixed top-0 left-0 w-64" : isCollapsed ? "w-16 md:w-16" : "w-64 md:w-64"}
                    bg-gradient-to-b from-gray-100 via-gray-200 to-gray-300 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700
                    border-r border-gray-300 dark:border-gray-700 shadow-xl`}
            >
                {/* Sidebar Header */}
                <SidebarHeader isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} username={username || "User"} role={role} />

                {/* Sidebar Links */}
                <nav className="flex flex-col space-y-2 mt-4">
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
            </aside>

            {/* ✅ Overlay & Blur Effect When Expanded on Small Screens */}
            {isMobile && !isCollapsed && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-md z-40"
                    onClick={() => setIsCollapsed(true)} // Collapse when clicking outside
                ></div>
            )}
        </>
    );
}
