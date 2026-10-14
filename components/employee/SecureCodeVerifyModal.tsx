"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { validateSecureCode } from "@/services/employee/employeeService";
import { ApiError } from "@/services/api/errorHandler";

interface Props {
    employeeName: string;
    employeeNtid: string;
    onVerified: (code: string) => void;
    onCancel: () => void;
    onSetupRequired: () => void;
    title?: string;
    confirmLabel?: string;
}

export default function SecureCodeVerifyModal({
    employeeName,
    employeeNtid,
    onVerified,
    onCancel,
    onSetupRequired,
    title = "Confirm Your Secure Code",
    confirmLabel = "Confirm & Clock In",
}: Props) {
    const [code, setCode] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [verifying, setVerifying] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
    };

    const handleSubmit = async () => {
        if (code.length !== 6) {
            setError("Enter your 6-digit secure code.");
            return;
        }

        setError(null);
        setVerifying(true);
        try {
            const result = await validateSecureCode(employeeNtid, code);
            if (result.codeValidation) {
                onVerified(code);
                return;
            }

            // The backend's own status check said this employee has a code, but validation says
            // otherwise - send them through setup instead of showing a confusing retry loop.
            if (result.message.toLowerCase().includes("not configured")) {
                onSetupRequired();
                return;
            }

            setCode("");
            setError(result.message);
        } catch (err) {
            setError(err instanceof ApiError ? err.message : "Failed to verify your code. Please try again.");
        } finally {
            setVerifying(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 text-center">
                    <ShieldCheck className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{employeeName}</p>
                </div>

                <div className="p-6 space-y-4">
                    {error && (
                        <p className="text-sm text-rose-600 dark:text-rose-400 text-center">{error}</p>
                    )}

                    <input
                        type="password"
                        inputMode="numeric"
                        value={code}
                        onChange={handleChange}
                        autoFocus
                        className="w-full text-center tracking-[0.4em] text-lg rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="••••••"
                    />

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={verifying || code.length !== 6}
                        className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-60"
                    >
                        {verifying ? "Verifying..." : confirmLabel}
                    </button>

                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={verifying}
                        className="w-full text-sm font-medium text-gray-600 dark:text-gray-300 hover:underline disabled:opacity-60"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
