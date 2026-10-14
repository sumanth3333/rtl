"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useEmployee } from "@/hooks/useEmployee";
import { useLogout } from "@/hooks/useLogout";
import { clockInEmployee, clockOutEmployee, getSecureCodeStatus } from "@/services/employee/employeeService";
import { ApiError } from "@/services/api/errorHandler";
import { useRouter } from "next/navigation";
import SecureCodeSetupModal from "@/components/employee/SecureCodeSetupModal";
import SecureCodeVerifyModal from "@/components/employee/SecureCodeVerifyModal";

type SidebarFooterProps = {
    isCollapsed: boolean;
};

type ClockInErrorKind = "permission" | "location-required" | "distance" | "store-config" | "generic";

interface ClockInErrorState {
    kind: ClockInErrorKind;
    title: string;
    message: string;
}

const getCurrentPosition = (): Promise<GeolocationPosition> =>
    new Promise((resolve, reject) => {
        if (typeof navigator === "undefined" || !navigator.geolocation) {
            reject(new Error("Geolocation is not supported on this device."));
            return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
        });
    });

const classifyClockInError = (error: unknown): ClockInErrorState => {
    if (error instanceof ApiError) {
        const message = error.message;
        const lowerMessage = message.toLowerCase();
        const distanceMeters = error.data?.distanceMeters;

        if (distanceMeters !== null && distanceMeters !== undefined) {
            return { kind: "distance", title: "Too Far From Store", message };
        }
        if (lowerMessage.includes("location is required")) {
            return { kind: "location-required", title: "Location Required", message };
        }
        if (lowerMessage.includes("store location is not configured")) {
            return { kind: "store-config", title: "Store Setup Issue", message };
        }
        return { kind: "generic", title: "Clock-In Failed", message };
    }

    return {
        kind: "permission",
        title: "Location Access Needed",
        message:
            "We couldn't get your current location. Please allow location access for this site in your browser and try again.",
    };
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
    const router = useRouter();
    const logout = useLogout();
    const [isClockedIn, setIsClockedIn] = useState<boolean>(isClockin);
    const [showEarlyClockoutModal, setShowEarlyClockoutModal] =
        useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isClockingIn, setIsClockingIn] = useState(false);
    const [clockInError, setClockInError] = useState<ClockInErrorState | null>(null);
    const [showSecureCodeSetup, setShowSecureCodeSetup] = useState(false);
    const [showSecureCodeVerify, setShowSecureCodeVerify] = useState(false);

    useEffect(() => {
        setIsClockedIn(isClockin);
    }, [isClockin]);

    const isEligibleRole = role === "EMPLOYEE" || role === "MANAGER";
    if (!isEligibleRole) { return null; }

    const performClockIn = async () => {
        if (!employee || !store) { return; }

        setClockInError(null);
        setIsClockingIn(true);

        try {
            // ✅ Location must come from the device; never fall back to 0/0 or the store's coordinates
            const position = await getCurrentPosition();

            await clockInEmployee(employee.employeeNtid, store.dealerStoreId, {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracyMeters: position.coords.accuracy,
            });

            const currentTime = new Date().toLocaleTimeString();
            setClockIn(true, store.storeName, currentTime);

            // ✅ Redirect to inventory with message
            router.push(
                `/dashboard/employee/log-inventory?notice=clockin`
            );
        } catch (error) {
            console.error("Clock-in failed:", error);
            setClockInError(classifyClockInError(error));
        } finally {
            setIsClockingIn(false);
        }
    };

    const handleClockIn = async () => {
        if (!employee || !store) {
            console.error("❌ Employee or Store data is missing.");
            return;
        }

        setClockInError(null);
        setIsClockingIn(true);

        // ✅ A secure code must be set up before the very first clock-in attempt
        let status;
        try {
            status = await getSecureCodeStatus(employee.employeeNtid);
        } catch (error) {
            console.error("Failed to check secure code status:", error);
            setIsClockingIn(false);
            setClockInError({
                kind: "generic",
                title: "Clock-In Failed",
                message: "We couldn't verify your secure code setup. Please try again.",
            });
            return;
        }

        setIsClockingIn(false);

        if (!status.secureCodeSetup) {
            setShowSecureCodeSetup(true);
            return;
        }

        // ✅ Already set up - confirm the code every time before actually clocking in
        setShowSecureCodeVerify(true);
    };

    const handleSecureCodeSetupComplete = () => {
        setShowSecureCodeSetup(false);
        performClockIn();
    };

    const handleSecureCodeVerified = () => {
        setShowSecureCodeVerify(false);
        performClockIn();
    };

    const handleSecureCodeVerifyCancel = () => {
        setShowSecureCodeVerify(false);
    };

    const handleSecureCodeVerifySetupRequired = () => {
        setShowSecureCodeVerify(false);
        setShowSecureCodeSetup(true);
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
            <div className="border-t border-slate-200/90 bg-white/60 px-3 py-3 backdrop-blur-md dark:border-slate-800/90 dark:bg-slate-900/55">
                {!isCollapsed && (
                    <>
                        <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
                            Shift Actions
                        </p>
                        {!isClockedIn ? (
                            <button
                                className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
                                onClick={handleClockIn}
                                disabled={isClockingIn}
                            >
                                {isClockingIn ? "Checking your location..." : "Click Here to Clock In"}
                            </button>
                        ) : (
                            <button
                                className="w-full rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:from-amber-600 hover:to-orange-700"
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

            {/* Clock-In Location Error Modal */}
            {clockInError && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl text-center">
                        <h2 className="text-base font-semibold text-zinc-900">
                            {clockInError.title}
                        </h2>
                        <p className="mt-3 text-sm text-zinc-700">
                            {clockInError.message}
                        </p>

                        <div className="mt-5 flex justify-center gap-2">
                            <button
                                type="button"
                                className="rounded-lg border border-zinc-200 px-4 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                                onClick={() => setClockInError(null)}
                            >
                                Close
                            </button>
                            {clockInError.kind !== "store-config" && (
                                <button
                                    type="button"
                                    className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                                    onClick={() => {
                                        setClockInError(null);
                                        handleClockIn();
                                    }}
                                >
                                    Try Again
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Secure Code Setup - blocks everything except logout until completed */}
            {showSecureCodeSetup && employee && (
                <SecureCodeSetupModal
                    employeeName={employee.employeeName}
                    employeeNtid={employee.employeeNtid}
                    onComplete={handleSecureCodeSetupComplete}
                    onLogout={logout}
                />
            )}

            {/* Secure Code Verify - required before every clock-in once already set up */}
            {showSecureCodeVerify && employee && (
                <SecureCodeVerifyModal
                    employeeName={employee.employeeName}
                    employeeNtid={employee.employeeNtid}
                    onVerified={handleSecureCodeVerified}
                    onCancel={handleSecureCodeVerifyCancel}
                    onSetupRequired={handleSecureCodeVerifySetupRequired}
                />
            )}
        </>
    );
}
