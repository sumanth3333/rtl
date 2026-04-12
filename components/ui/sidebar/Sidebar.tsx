"use client";

import SidebarItem from "@/components/ui/sidebar/SidebarItem";
import SidebarHeader from "@/components/ui/sidebar/SidebarHeader";
import SidebarFooter from "@/components/ui/sidebar/SidebarFooter";
import { Role, SidebarLink } from "@/config/roleConfig";
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
    const { role, refreshAuth, isAuthenticated } = useAuth() as {
        role?: Role | string;
        refreshAuth: () => Promise<void>;
        isAuthenticated?: boolean;
    };

    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        const fetchRole = async () => {
            // If the user is logged out (no role and not authenticated), skip refresh attempts
            if (!role && isAuthenticated === false) {
                setAuthLoading(false);
                return;
            }

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
    }, [role, refreshAuth, isAuthenticated]);

    const { employee, store } = useEmployee();
    // 🧭 Resolve employeeNtid & initial companyName (always called)
    const employeeNtid = employee?.employeeNtid;

    // 🏢 Company name hook (always called)
    const { companyName, loading: companyLoading } = useCompanyName({
        employeeNtid,
    });

    const normalizedRole = (typeof role === "string" ? role.toUpperCase() : role) as Role | undefined;
    const typedRole = normalizedRole ?? "EMPLOYEE";

    const links = useMemo(() => {
        if (authLoading) { return []; }
        return getSidebarLinks(typedRole, companyName);
    }, [authLoading, typedRole, companyName]);

    const groupedLinks = useMemo(() => {
        const groups = new Map<string, SidebarLink[]>();
        links.forEach((link) => {
            const section = link.section ?? "General";
            if (!groups.has(section)) {
                groups.set(section, []);
            }
            groups.get(section)?.push(link);
        });
        return Array.from(groups.entries());
    }, [links]);

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
          bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900
          border-r border-slate-200/90 dark:border-slate-800/90 shadow-[0_8px_30px_rgba(15,23,42,0.08)] dark:shadow-[0_10px_30px_rgba(2,6,23,0.5)]`}
            >
                {/* Header */}
                <SidebarHeader isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

                {/* Scrollable Content */}
                <div className="overflow-y-auto overscroll-contain scrollbar-hide pb-8">
                    {showLoading ? (
                        <div className="p-4 text-sm text-slate-600 dark:text-slate-300">Loading Sidebar...</div>
                    ) : (
                        <>
                            <nav className={`mt-3 w-full pb-6 ${isCollapsed ? "px-1.5" : "px-2"}`}>
                                <div className={`flex flex-col ${isCollapsed ? "gap-2.5" : "gap-3"}`}>
                                    {groupedLinks.map(([section, sectionLinks], index) => (
                                        <div
                                            key={section}
                                            className={`space-y-1.5 ${index > 0
                                                ? isCollapsed
                                                    ? "pt-2"
                                                    : "pt-2 border-t border-slate-200/90 dark:border-slate-800/80"
                                                : ""}`}
                                        >
                                            {!isCollapsed && (
                                                <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500/90 dark:text-slate-400/90">
                                                    {section}
                                                </p>
                                            )}
                                            {isCollapsed && index > 0 && (
                                                <div className="mx-auto h-px w-6 bg-slate-300/80 dark:bg-slate-700/80" />
                                            )}
                                            <div className="flex flex-col space-y-1">
                                                {sectionLinks.map((link) => (
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
                                            </div>
                                        </div>
                                    ))}
                                </div>
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
