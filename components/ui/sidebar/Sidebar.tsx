"use client";

import SidebarItem from "@/components/ui/sidebar/SidebarItem";
import SidebarHeader from "@/components/ui/sidebar/SidebarHeader";
import SidebarFooter from "@/components/ui/sidebar/SidebarFooter";
import { sidebarLinks, Role } from "@/config/roleConfig";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { refreshToken } from "@/services/auth/authService";

export default function Sidebar({
    isCollapsed,
    setIsCollapsed,
    isMobile,
}: {
    isCollapsed: boolean;
    setIsCollapsed: (value: boolean) => void;
    isMobile: boolean;
}) {
    const { role, refreshAuth } = useAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRole = async () => {
            if (!role) {
                try {
                    const refreshed = await refreshToken();
                    if (refreshed) {
                        await refreshAuth();
                    }
                } catch (error) {
                    console.error("Failed to refresh token:", error);
                }
            }
            setLoading(false);
        };

        fetchRole();
    }, [role, refreshAuth]);

    useEffect(() => {
        if (isMobile && !isCollapsed) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isMobile, isCollapsed]);

    if (loading || !role) {
        return <div className="text-gray-600 dark:text-gray-300 p-4">Loading Sidebar...</div>;
    }

    const typedRole = role as Role;

    return (
        <>
            {/* Sidebar */}
            <aside
                className={`h-screen flex flex-col transition-transform duration-300 ease-in-out z-50
                    ${isMobile
                        ? isCollapsed
                            ? "hidden"
                            : "fixed top-0 left-0 w-64 transform translate-x-0"
                        : isCollapsed
                            ? "w-16 hidden sm:flex"
                            : "w-64 flex"
                    }
                    bg-gradient-to-b from-gray-100 via-gray-200 to-gray-300 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700
                    border-r border-gray-300 dark:border-gray-700 shadow-xl`}
            >
                {/* Sidebar Header */}
                <SidebarHeader isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

                {/* Sidebar Content - Scrollable */}
                <div className="overflow-y-auto overscroll-contain scrollbar-hide pb-8">
                    <nav className="flex flex-col space-y-2 mt-4 w-full px-2 pb-6">
                        {sidebarLinks[typedRole]?.map((link) => (
                            <SidebarItem
                                key={link.path}
                                name={link.name}
                                path={link.path}
                                icon={link.icon}
                                isCollapsed={isCollapsed}
                                onClick={() => {
                                    if (isMobile) {
                                        setIsCollapsed(true);
                                    }
                                }}
                            />
                        ))}
                    </nav>

                    {/* Sidebar Footer - Appears Just Below Content */}
                    <div className="pb-12">
                        <SidebarFooter isCollapsed={isCollapsed} />
                    </div>
                </div>
            </aside>

            {/* Overlay - Click to Collapse Sidebar on Mobile */}
            {isMobile && !isCollapsed && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-md z-40"
                    onClick={() => setIsCollapsed(true)}
                ></div>
            )}
        </>
    );
}
