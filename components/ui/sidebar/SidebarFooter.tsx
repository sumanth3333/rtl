"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useEmployee } from "@/hooks/useEmployee";
import { clockInEmployee } from "@/services/employee/employeeService";

export default function SidebarFooter({ isCollapsed }: { isCollapsed: boolean }) {
    const { isClockin, setClockIn, clockinLocation, clockinTime, employee, store } = useEmployee();
    const { role } = useAuth();
    const [isClockedIn, setIsClockedIn] = useState<boolean>(isClockin);

    useEffect(() => {
        setIsClockedIn(isClockin);
    }, [isClockin]);

    const handleClockIn = async () => {
        if (!employee || !store) {
            console.error("❌ Employee or Store data is missing.");
            return;
        }

        const response = await clockInEmployee(employee?.employeeNtid, store?.dealerStoreId);
        if (response.error) {
            console.error("Clock-in failed:", response.error);
        } else {
            const currentTime = new Date().toLocaleTimeString();
            setClockIn(true, store?.storeName, currentTime);
        }
    };

    const isEligibleRole = role === "EMPLOYEE" || role === "MANAGER";

    if (!isEligibleRole) { return null; }

    return (
        <div className={`p-4 mt-auto border-t border-gray-300 dark:border-gray-700 bg-gray-200 dark:bg-gray-800`}>
            {!isCollapsed && (
                <button
                    className={`w-full py-2 px-4 text-white rounded-lg transition-all duration-300 ${isClockedIn ? "bg-green-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                        }`}
                    onClick={handleClockIn}
                    disabled={isClockedIn}
                >
                    {isClockedIn ? "Clocked In" : "Clock In"}
                </button>
            )}
        </div>
    );
}
