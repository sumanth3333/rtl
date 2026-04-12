"use client";

import {
    ChevronLeftIcon,
    UserCircleIcon,
    IdentificationIcon,
    MapPinIcon,
    BriefcaseIcon,
    ClockIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/hooks/useAuth";
import { useOwner } from "@/hooks/useOwner";
import { useEmployee } from "@/hooks/useEmployee";

interface SidebarHeaderProps {
    isCollapsed: boolean;
    setIsCollapsed: (value: boolean) => void;
}

export default function SidebarHeader({ isCollapsed, setIsCollapsed }: SidebarHeaderProps) {
    const { username, role } = useAuth();
    const { companyName } = useOwner();
    const { employee, store, clockinTime, clockinLocation, isClockin } = useEmployee();
    const displayName =
        role === "OWNER" && companyName
            ? companyName
            : role === "EMPLOYEE" && employee
                ? employee.employeeName
                : username || "User";
    const initials = displayName?.trim().charAt(0)?.toUpperCase() || "U";

    return (
        <div
            className={`border-b border-gray-200/90 dark:border-gray-700/90 bg-white/65 dark:bg-gray-900/65 backdrop-blur-lg
            ${isCollapsed ? "px-2 py-2.5" : "px-3 py-3"}`}
        >
            <div className={`flex ${isCollapsed ? "flex-col items-center gap-2" : "items-start justify-between gap-2"}`}>
                <div className={`flex ${isCollapsed ? "flex-col items-center gap-1.5" : "items-center gap-2.5"} min-w-0`}>
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-600 text-sm font-semibold uppercase text-white shadow-sm">
                        {initials || <UserCircleIcon className="h-4 w-4 text-white" />}
                    </div>

                    {!isCollapsed && (
                        <div className="min-w-0">
                            <h2 className="truncate text-[13px] font-semibold text-gray-900 dark:text-gray-100">
                                {displayName}
                            </h2>
                            <div className="mt-0.5 flex items-center gap-1.5">
                                {role === "EMPLOYEE" && employee?.employeeNtid ? (
                                    <span className="inline-flex max-w-[140px] items-center gap-1 truncate rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                        <IdentificationIcon className="h-3 w-3 shrink-0" />
                                        <span className="truncate">{employee.employeeNtid}</span>
                                    </span>
                                ) : null}
                                {role !== "OWNER" && (
                                    <span className="inline-flex items-center rounded-md bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-blue-800 dark:bg-blue-500/20 dark:text-blue-200">
                                        {role}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={`rounded-md border border-gray-300/90 bg-white p-1.5 text-gray-700 shadow-sm transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700
                    ${isCollapsed ? "h-8 w-8" : "h-8 w-8"}`}
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    <ChevronLeftIcon
                        className={`h-4 w-4 transition-transform duration-200 ${isCollapsed ? "rotate-180" : ""}`}
                    />
                </button>
            </div>

            {!isCollapsed && role === "EMPLOYEE" && employee && store && (
                <div className="mt-2.5 rounded-lg border border-gray-200 bg-gray-50/80 p-2.5 text-[11px] dark:border-gray-700 dark:bg-gray-800/60">
                    <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300">
                            <BriefcaseIcon className="h-3.5 w-3.5" />
                            Store
                        </span>
                        <span className="max-w-[130px] truncate font-medium text-gray-800 dark:text-gray-100">
                            {store.storeName || "N/A"}
                        </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300">
                            <MapPinIcon className="h-3.5 w-3.5" />
                            Store ID
                        </span>
                        <span className="max-w-[130px] truncate text-gray-700 dark:text-gray-200">
                            {store.dealerStoreId || "N/A"}
                        </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300">
                            <ClockIcon className="h-3.5 w-3.5" />
                            Clock-in
                        </span>
                        <span className="max-w-[130px] truncate text-gray-700 dark:text-gray-200">
                            {isClockin ? clockinTime : "N/A"}
                        </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300">
                            <MapPinIcon className="h-3.5 w-3.5" />
                            At
                        </span>
                        <span className="max-w-[130px] truncate text-gray-700 dark:text-gray-200">
                            {isClockin ? clockinLocation : "N/A"}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
