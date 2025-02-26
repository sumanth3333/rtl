"use client";

import {
    ChevronLeftIcon,
    UserCircleIcon,
    IdentificationIcon,
    MapPinIcon,
    BriefcaseIcon,
    ClockIcon,
    BuildingOfficeIcon,
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
    const { companyName, isOwner } = useOwner();
    const { employee, store, clockinTime, clockinLocation, isClockin } = useEmployee();

    return (
        <div
            className={`flex flex-col border-b transition-all duration-300
            ${isCollapsed ? "px-2 py-2" : "px-4 py-4"} 
            bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg shadow-md dark:shadow-lg border-gray-200 dark:border-gray-700`}
        >
            {/* ✅ Identity Row with Collapse Button */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* ✅ Profile Icon */}
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-teal-600 text-white font-semibold uppercase">
                        {role === "EMPLOYEE" && employee
                            ? employee.employeeName.charAt(0)
                            : username
                                ? username.charAt(0)
                                : <UserCircleIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />}
                    </div>

                    {/* ✅ Identity Details - Completely Hidden When Collapsed */}
                    {!isCollapsed && (
                        <div className="truncate">
                            {role === "EMPLOYEE" && employee ? (
                                <>
                                    <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                        {employee.employeeName}
                                    </h2>
                                    <p className="flex items-center text-xs text-gray-600 dark:text-gray-400 gap-1">
                                        <IdentificationIcon className="w-4 h-4" />
                                        {employee.employeeNtid}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                        {username || "User"}
                                    </h2>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">{role}</p>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* ✅ Collapse Button - Rotates Correctly */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-transform duration-300 transform"
                    aria-label="Toggle Sidebar"
                >
                    <ChevronLeftIcon
                        className={`w-4 h-4 text-gray-900 dark:text-white transition-transform duration-300 
                        ${isCollapsed ? "rotate-0" : "rotate-180"}`}
                    />
                </button>
            </div>

            {/* ✅ Additional Details in a Grid Format */}
            {!isCollapsed && (
                <>
                    {role === "EMPLOYEE" && employee && store && (
                        <div className="mt-2">
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 bg-gray-100 dark:bg-gray-800 p-2 rounded shadow text-xs">
                                <div className="flex items-center gap-1">
                                    <BriefcaseIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Store:</span>
                                </div>
                                <div className="text-gray-700 dark:text-gray-300 truncate">{store?.storeName || "N/A"}</div>

                                <div className="flex items-center gap-1">
                                    <MapPinIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Store ID:</span>
                                </div>
                                <div className="text-gray-700 dark:text-gray-300 truncate">{store?.dealerStoreId || "N/A"}</div>

                                <div className="flex items-center gap-1">
                                    <ClockIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Clock-in:</span>
                                </div>
                                <div className="text-gray-700 dark:text-gray-300">{isClockin ? clockinTime : "N/A"}</div>

                                <div className="flex items-center gap-1">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Clock-in At:</span>
                                </div>
                                <div className="text-gray-700 dark:text-gray-300 truncate">{isClockin ? clockinLocation : "N/A"}</div>
                            </div>
                        </div>
                    )}

                    {(role === "OWNER" || role === "ADMIN") && isOwner && companyName && (
                        <div className="mt-2">
                            <div className="grid grid-cols-2 items-center gap-x-4 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs text-gray-700 dark:text-gray-300">
                                <div className="flex items-center gap-1">
                                    <BuildingOfficeIcon className="w-4 h-4" />
                                    <span className="font-medium">Company Name:</span>
                                </div>
                                <div>{companyName}</div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
