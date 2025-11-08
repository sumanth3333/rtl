"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type QuickJumpTriggerProps = {
    label?: string;
    tapWindowMs?: number;
    remindersPath?: string;
    upgradesPath?: string;
    recordImeiPath?: string;
    pinCode?: string;
    canNavigate?: (target: "reminders" | "upgrades" | "recordImei") => boolean;
    className?: string;
};

export default function QuickJumpTrigger({
    label = "OneClick",
    tapWindowMs = 450,
    remindersPath = "/dashboard/employee/remainders",
    upgradesPath = "/dashboard/employee/manage-upgrades/available-devices",
    recordImeiPath = "/dashboard/employee/record-imei",
    pinCode = "9999",
    canNavigate,
    className,
}: QuickJumpTriggerProps) {
    const router = useRouter();

    const [tapCount, setTapCount] = useState(0);
    const tapTimerRef = useRef<number | null>(null);

    const [showPin, setShowPin] = useState(false);
    const [pin, setPin] = useState("");
    const [pinError, setPinError] = useState<string | null>(null);
    const [pendingTarget, setPendingTarget] = useState<{
        target: "reminders" | "upgrades" | "recordImei";
        path: string;
    } | null>(null);

    useEffect(() => {
        return () => {
            if (tapTimerRef.current) { window.clearTimeout(tapTimerRef.current); }
        };
    }, []);

    const navigateIfAllowed = (
        target: "reminders" | "upgrades" | "recordImei",
        path: string
    ) => {
        if (!canNavigate || canNavigate(target)) {
            router.push(path);
        }
    };

    const handleTap = () => {
        setPinError(null);
        setTapCount((prev) => {
            const next = prev + 1;

            if (tapTimerRef.current) { window.clearTimeout(tapTimerRef.current); }
            tapTimerRef.current = window.setTimeout(() => {
                if (next === 2) {
                    setPendingTarget({ target: "reminders", path: remindersPath });
                    setShowPin(true);
                } else if (next === 3) {
                    setPendingTarget({ target: "upgrades", path: upgradesPath });
                    setShowPin(true);
                } else if (next === 4) {
                    setPendingTarget({ target: "recordImei", path: recordImeiPath });
                    setShowPin(true);
                }

                setTapCount(0);
                if (tapTimerRef.current) {
                    window.clearTimeout(tapTimerRef.current);
                    tapTimerRef.current = null;
                }
            }, tapWindowMs);

            return next;
        });
    };

    const closePinModal = () => {
        setShowPin(false);
        setPin("");
        setPinError(null);
        setPendingTarget(null);
        // restore scroll
        if (typeof document !== "undefined") { document.body.style.overflow = ""; }
    };

    const submitPin = (e?: React.FormEvent) => {
        if (e) { e.preventDefault(); }
        if (pin === pinCode && pendingTarget) {
            const { target, path } = pendingTarget;
            closePinModal();
            navigateIfAllowed(target, path);
        } else {
            setPinError("Incorrect PIN");
        }
    };

    // Lock body scroll while modal is open
    useEffect(() => {
        if (showPin) {
            if (typeof document !== "undefined") { document.body.style.overflow = "hidden"; }
        } else {
            if (typeof document !== "undefined") { document.body.style.overflow = ""; }
        }
    }, [showPin]);

    return (
        <>
            {/* Trigger */}
            <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                onClick={handleTap}
                className={
                    className ??
                    "text-lg font-semibold tracking-widest text-gray-900 dark:text-gray-100 uppercase px-3 py-1 " +
                    "border border-gray-900 dark:border-gray-100 rounded-md transition-all duration-300 select-none"
                }
                aria-label="Hidden shortcuts trigger"
            >
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{label}</span>
            </motion.button>

            {/* Modal via portal to avoid stacking issues */}
            {showPin &&
                typeof document !== "undefined" &&
                createPortal(
                    <>
                        {/* Backdrop (separate layer) */}
                        <div
                            className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm"
                            onClick={closePinModal}
                            // improve mobile tap behavior
                            style={{ touchAction: "manipulation" }}
                        />

                        {/* Dialog (top layer, receives clicks) */}
                        <div
                            className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
                            aria-modal="true"
                            role="dialog"
                        >
                            <div
                                className="pointer-events-auto w-full max-w-xs rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-5 shadow-2xl"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                    Enter PIN
                                </h2>

                                <form onSubmit={submitPin} className="space-y-3" noValidate>
                                    <input
                                        inputMode="numeric"
                                        pattern="\d*"
                                        maxLength={6}
                                        value={pin}
                                        onChange={(e) => {
                                            setPin(e.target.value);
                                            setPinError(null);
                                        }}
                                        className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90
                    text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-300/50 dark:focus:ring-gray-700/40"
                                        placeholder="PIN"
                                        autoFocus
                                    />

                                    {pinError && (
                                        <p className="text-sm text-red-600 dark:text-red-500">{pinError}</p>
                                    )}

                                    <div className="flex gap-2 pt-1">
                                        <button
                                            type="button"
                                            onClick={closePinModal}
                                            onTouchStart={(e) => {
                                                e.preventDefault(); // ensure tap doesn't fall through on mobile
                                                closePinModal();
                                            }}
                                            className="flex-1 px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            onTouchStart={(e) => {
                                                // make sure touch triggers submit reliably on iOS
                                                // allow form's onSubmit to handle navigation
                                            }}
                                            className="flex-1 px-3 py-2 rounded-xl bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 hover:opacity-90"
                                        >
                                            Unlock
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </>,
                    document.body
                )}
        </>
    );
}
