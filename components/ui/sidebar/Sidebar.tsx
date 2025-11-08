"use client";

import SidebarItem from "@/components/ui/sidebar/SidebarItem";
import SidebarHeader from "@/components/ui/sidebar/SidebarHeader";
import SidebarFooter from "@/components/ui/sidebar/SidebarFooter";
import { Role } from "@/config/roleConfig";
import { getSidebarLinks } from "@/config/roleConfig.getters";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useMemo, useState } from "react";
import { refreshToken } from "@/services/auth/authService";
import { useCompanyName } from "@/hooks/useComanyName";
import { useEmployee } from "@/hooks/useEmployee";

export default function Sidebar({
    isCollapsed,
    setIsCollapsed,
    isMobile,
}: {
    isCollapsed: boolean;
    setIsCollapsed: (value: boolean) => void;
    isMobile: boolean;
}) {
    const { role, refreshAuth } = useAuth() as {
        role?: Role | string;
        refreshAuth: () => Promise<void>;
    };

    const [authLoading, setAuthLoading] = useState(true);

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
            setAuthLoading(false);
        };
        fetchRole();
    }, [role, refreshAuth]);

    const { employee, store } = useEmployee();
    // 🧭 Resolve employeeNtid & initial companyName (always called)
    const employeeNtid = employee?.employeeNtid;

    // 🏢 Company name hook (always called)
    const { companyName, loading: companyLoading } = useCompanyName({
        employeeNtid,
    });

    const typedRole = (role as Role) ?? "EMPLOYEE";

    const links = useMemo(() => {
        if (authLoading) { return []; }
        return getSidebarLinks(typedRole, companyName);
    }, [authLoading, typedRole, companyName]);

    const showLoading = authLoading || companyLoading || !role;

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
                {/* Header */}
                <SidebarHeader isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

                {/* Scrollable Content */}
                <div className="overflow-y-auto overscroll-contain scrollbar-hide pb-8">
                    {showLoading ? (
                        <div className="text-gray-600 dark:text-gray-300 p-4">Loading Sidebar...</div>
                    ) : (
                        <>
                            <nav className="flex flex-col space-y-2 mt-4 w-full px-2 pb-6">
                                {links.map((link) => (
                                    <SidebarItem
                                        key={link.path}
                                        name={link.name}
                                        path={link.path}
                                        icon={link.icon}
                                        isCollapsed={isCollapsed}
                                        onClick={() => {
                                            if (isMobile) { setIsCollapsed(true); }
                                        }}
                                    />
                                ))}
                            </nav>

                            {/* Footer */}
                            <div className="pb-12">
                                <SidebarFooter isCollapsed={isCollapsed} />
                            </div>
                        </>
                    )}
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isMobile && !isCollapsed && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-md z-40"
                    onClick={() => setIsCollapsed(true)}
                />
            )}
        </>
    );
}
