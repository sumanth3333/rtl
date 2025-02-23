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
import { useAuth } from "@/hooks/useAuth"; // ✅ Import authentication hook
import { useOwner } from "@/hooks/useOwner"; // ✅ Import owner-specific hook
import { useEmployee } from "@/hooks/useEmployee"; // ✅ Import Employee context

interface SidebarHeaderProps {
    isCollapsed: boolean;
    setIsCollapsed: (value: boolean) => void;
}

export default function SidebarHeader({ isCollapsed, setIsCollapsed }: SidebarHeaderProps) {
    const { username, role } = useAuth();
    const { companyName, isOwner } = useOwner();
    const { employee, store, clockinTime, clockinLocation, isClockin } = useEmployee();

    return (
        <div className={`relative flex items-center justify-between px-4 py-5 border-b 
            bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg shadow-md dark:shadow-lg 
            border-gray-200 dark:border-gray-700 transition-all duration-300
            ${isCollapsed ? "py-3 px-2" : "py-5 px-4"}`}>

            {/* ✅ Employee View */}
            {!isCollapsed && role === "EMPLOYEE" && employee && store && (
                <div className="flex flex-col gap-3">
                    {/* Employee Name */}
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-teal-600 text-white font-semibold uppercase">
                            {employee.employeeName.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{employee.employeeName}</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                <IdentificationIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                {employee.employeeNtid}
                            </p>
                        </div>
                    </div>

                    {/* Store & Clock-in Details */}
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg shadow-md flex flex-col gap-2">
                        <p className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <BriefcaseIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            Store: <span className="font-medium">{store?.storeName || "N/A"}</span>
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <MapPinIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            Store ID: <span className="font-medium">{store?.dealerStoreId || "N/A"}</span>
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <ClockIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            Clock-in: <span className="font-medium">{isClockin ? clockinTime : "N/A"}</span>
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            Clock-in Location: <span className="font-medium">{isClockin ? clockinLocation : "N/A"}</span>
                        </p>
                    </div>
                </div>
            )}

            {/* ✅ Owner/Admin View */}
            {!isCollapsed && (role === "OWNER" || role === "ADMIN") && (
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold uppercase">
                            {username ? username.charAt(0) : <UserCircleIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />}
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{username || "User"}</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{role}</p>
                        </div>
                    </div>

                    {isOwner && companyName && (
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-md">
                            <BuildingOfficeIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            <span>{companyName}</span>
                        </div>
                    )}
                </div>
            )}

            {/* ✅ Collapse Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={`p-2 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700
                    transition-all duration-300 transform ${isCollapsed ? "rotate-180" : "rotate-0"}`}
            >
                <ChevronLeftIcon className="w-4 h-4 text-gray-900 dark:text-white" />
            </button>
        </div>
    );
}
