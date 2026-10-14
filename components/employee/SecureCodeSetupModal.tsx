"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { setupSecureCode } from "@/services/employee/employeeService";
import { ApiError } from "@/services/api/errorHandler";

interface Props {
    employeeName: string;
    employeeNtid: string;
    onComplete: () => void;
    onLogout: () => Promise<void> | void;
}

const isValidCode = (value: string) => /^\d{6}$/.test(value);

export default function SecureCodeSetupModal({ employeeName, employeeNtid, onComplete, onLogout }: Props) {
    const [code, setCode] = useState("");
    const [confirmCode, setConfirmCode] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    const handleDigitsOnly = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setter(e.target.value.replace(/\D/g, "").slice(0, 6));
    };

    const handleSubmit = async () => {
        setError(null);

        if (!isValidCode(code)) {
            setError("Code must be exactly 6 digits.");
            return;
        }
        if (code !== confirmCode) {
            setError("Codes do not match.");
            return;
        }

        setSubmitting(true);
        try {
            await setupSecureCode(employeeNtid, code);
            onComplete();
        } catch (err) {
            setError(err instanceof ApiError ? err.message : "Failed to set up your secure code. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            await onLogout();
        } finally {
            setLoggingOut(false);
        }
    };

    return (
        // ✅ No backdrop-click or Escape dismissal, and no X button - this is intentionally a hard
        // block until setup completes. Logout is the only other way out.
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 text-center">
                    <ShieldCheck className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Set Up Your Secure Code</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        You&apos;ll need to confirm this code every time you clock in.
                    </p>
                </div>

                <div className="p-6 space-y-4">
                    <div className="rounded-md bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 px-4 py-3 text-center">
                        <p className="text-xs uppercase tracking-wide text-blue-700 dark:text-blue-300 font-semibold">Setting this up for</p>
                        <p className="text-base font-semibold text-gray-900 dark:text-white mt-0.5">{employeeName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{employeeNtid}</p>
                    </div>

                    {error && (
                        <p className="text-sm text-rose-600 dark:text-rose-400 text-center">{error}</p>
                    )}

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            New Code (6 digits)
                        </label>
                        <input
                            type="password"
                            inputMode="numeric"
                            value={code}
                            onChange={handleDigitsOnly(setCode)}
                            className="w-full text-center tracking-[0.4em] text-lg rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="••••••"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            Confirm Code
                        </label>
                        <input
                            type="password"
                            inputMode="numeric"
                            value={confirmCode}
                            onChange={handleDigitsOnly(setConfirmCode)}
                            className="w-full text-center tracking-[0.4em] text-lg rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="••••••"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting || loggingOut}
                        className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-60"
                    >
                        {submitting ? "Setting Up..." : "Set Up Code & Clock In"}
                    </button>
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        You can&apos;t use the app until this is set up. If this isn&apos;t a good time, you can log out instead.
                    </p>
                    <button
                        type="button"
                        onClick={handleLogout}
                        disabled={submitting || loggingOut}
                        className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:underline disabled:opacity-60"
                    >
                        {loggingOut ? "Logging out..." : "Log Out Instead"}
                    </button>
                </div>
            </div>
        </div>
    );
}
