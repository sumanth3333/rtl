"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useEmployee } from "@/hooks/useEmployee";
import { clockInEmployee, clockOutEmployee } from "@/services/employee/employeeService";

type SidebarFooterProps = {
    isCollapsed: boolean;
};

export default function SidebarFooter({ isCollapsed }: SidebarFooterProps) {
    const {
        isClockin,
        setClockIn,
        clockinLocation,
        clockinTime,
        employee,
        store,
    } = useEmployee();
    const { role } = useAuth();

    const [isClockedIn, setIsClockedIn] = useState<boolean>(isClockin);
    const [showEarlyClockoutModal, setShowEarlyClockoutModal] =
        useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setIsClockedIn(isClockin);
    }, [isClockin]);

    const isEligibleRole = role === "EMPLOYEE" || role === "MANAGER";
    if (!isEligibleRole) { return null; }

    const handleClockIn = async () => {
        if (!employee || !store) {
            console.error("❌ Employee or Store data is missing.");
            return;
        }

        const response = await clockInEmployee(
            employee.employeeNtid,
            store.dealerStoreId
        );

        if (response.error) {
            console.error("Clock-in failed:", response.error);
        } else {
            const currentTime = new Date().toLocaleTimeString();
            setClockIn(true, store.storeName, currentTime);
        }
    };

    const handleOpenEarlyClockoutModal = () => {
        setShowEarlyClockoutModal(true);
    };

    const handleConfirmEarlyClockout = async () => {
        if (!employee || !store) {
            console.error("❌ Employee or Store data is missing.");
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await clockOutEmployee(
                employee.employeeNtid,
                store.dealerStoreId
            );

            if (response.error) {
                console.error("Clock-out failed:", response.error);
                // you can plug in your toast here
            } else {
                // Update local clock state
                setClockIn(false, "", "");
                setIsClockedIn(false);
            }
        } finally {
            setIsSubmitting(false);
            setShowEarlyClockoutModal(false);
        }
    };

    const handleCancelEarlyClockout = () => {
        setShowEarlyClockoutModal(false);
    };

    return (
        <>
            <div className="border-t border-gray-300 bg-gray-200 p-4 dark:border-gray-700 dark:bg-gray-800">
                {!isCollapsed && (
                    <>
                        {!isClockedIn ? (
                            <button
                                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:bg-blue-700"
                                onClick={handleClockIn}
                            >
                                Click Here to Clock In
                            </button>
                        ) : (
                            <button
                                className="w-full rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:bg-amber-700"
                                onClick={handleOpenEarlyClockoutModal}
                            >
                                Early Clock-out
                            </button>
                        )}
                    </>
                )}
            </div>

            {/* Early Clock-out Confirmation Modal */}
            {showEarlyClockoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
                        <h2 className="text-base font-semibold text-zinc-900">
                            Early Clock-out
                        </h2>
                        <p className="mt-3 text-sm text-zinc-700">
                            This will <span className="font-semibold">clock you out</span>{" "}
                            right now, but{" "}
                            <span className="font-semibold">your sale is not submitted</span>.
                        </p>
                        <p className="mt-2 text-sm text-zinc-700">
                            Please coordinate with the employee who will be closing the store to make sure{" "}
                            <span className="font-semibold">
                                your sale is submitted by the end of the day.
                            </span>
                        </p>

                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                type="button"
                                className="rounded-lg border border-zinc-200 px-4 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                                onClick={handleCancelEarlyClockout}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="rounded-lg bg-amber-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-70"
                                onClick={handleConfirmEarlyClockout}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Clocking out..." : "Confirm Clock-out"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
