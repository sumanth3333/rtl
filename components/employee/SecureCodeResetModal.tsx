"use client";

import { useEffect, useState } from "react";
import { ShieldQuestion } from "lucide-react";
import { useSecureCodeReset } from "@/hooks/useSecureCodeReset";

interface Props {
    employeeName: string;
    employeeNtid: string;
    onClose: () => void;
}

const isValidCode = (value: string) => /^\d{6}$/.test(value);

function useCountdown(expiresAt: number | null) {
    const [remainingMs, setRemainingMs] = useState(expiresAt ? expiresAt - Date.now() : 0);

    useEffect(() => {
        if (!expiresAt) {
            setRemainingMs(0);
            return;
        }
        setRemainingMs(expiresAt - Date.now());
        const interval = setInterval(() => {
            setRemainingMs(Math.max(0, expiresAt - Date.now()));
        }, 1000);
        return () => clearInterval(interval);
    }, [expiresAt]);

    return remainingMs;
}

export default function SecureCodeResetModal({ employeeName, employeeNtid, onClose }: Props) {
    const {
        step,
        sending, sendError, otpExpiresAt, sendOtp,
        verifying, verifyError, resetTokenExpiresAt, verifyOtp,
        confirming, confirmError, confirmReset,
    } = useSecureCodeReset(employeeNtid);

    const [otp, setOtp] = useState("");
    const [newCode, setNewCode] = useState("");
    const [confirmCode, setConfirmCode] = useState("");
    const [localError, setLocalError] = useState<string | null>(null);

    // ✅ Kick off send-otp as soon as the modal opens - no extra click needed
    useEffect(() => {
        sendOtp();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const otpRemainingMs = useCountdown(otpExpiresAt);
    const otpExpired = step === "awaiting-otp" && otpExpiresAt !== null && otpRemainingMs <= 0;
    const otpRemainingLabel = `${Math.floor(otpRemainingMs / 60000)}:${String(Math.floor((otpRemainingMs % 60000) / 1000)).padStart(2, "0")}`;

    const tokenRemainingMs = useCountdown(resetTokenExpiresAt);
    const tokenExpired = step === "awaiting-new-code" && resetTokenExpiresAt !== null && tokenRemainingMs <= 0;
    const tokenRemainingLabel = `${Math.floor(tokenRemainingMs / 60000)}:${String(Math.floor((tokenRemainingMs % 60000) / 1000)).padStart(2, "0")}`;

    const handleVerifyOtp = () => {
        if (otp.length !== 6) {
            setLocalError("Enter the 6-digit code sent to your email.");
            return;
        }
        setLocalError(null);
        verifyOtp(otp);
    };

    const handleResendOtp = () => {
        setOtp("");
        setLocalError(null);
        sendOtp();
    };

    const handleConfirmReset = () => {
        if (!isValidCode(newCode)) {
            setLocalError("New code must be exactly 6 digits.");
            return;
        }
        if (newCode !== confirmCode) {
            setLocalError("Codes do not match.");
            return;
        }
        setLocalError(null);
        confirmReset(newCode);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 text-center">
                    <ShieldQuestion className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Reset Secure Code</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{employeeName}</p>
                </div>

                <div className="p-6 space-y-4">
                    {step === "idle" && sending && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 text-center">Sending verification code...</p>
                    )}

                    {step === "idle" && !sending && sendError && (
                        <div className="space-y-3 text-center">
                            <p className="text-sm text-rose-600 dark:text-rose-400">{sendError}</p>
                            <button
                                type="button"
                                onClick={sendOtp}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {step === "awaiting-otp" && (
                        <div className="space-y-3">
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                Enter the 6-digit code sent to your registered email.
                            </p>

                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                disabled={otpExpired}
                                autoFocus
                                placeholder="••••••"
                                className="w-full text-center tracking-[0.4em] text-lg rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                            />

                            {!otpExpired && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">Code expires in {otpRemainingLabel}</p>
                            )}
                            {otpExpired && (
                                <p className="text-sm text-rose-600 dark:text-rose-400">Verification code has expired. Please request a new one.</p>
                            )}

                            {(localError || verifyError) && (
                                <p className="text-sm text-rose-600 dark:text-rose-400">{localError || verifyError}</p>
                            )}

                            <div className="flex gap-3">
                                {!otpExpired && (
                                    <button
                                        type="button"
                                        onClick={handleVerifyOtp}
                                        disabled={otp.length !== 6 || verifying}
                                        className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-60"
                                    >
                                        {verifying ? "Verifying..." : "Verify Code"}
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={sending}
                                    className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-60"
                                >
                                    {otpExpired ? "Request New Code" : "Resend"}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === "awaiting-new-code" && (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600 dark:text-gray-300">Choose a new 6-digit secure code.</p>

                            {!tokenExpired && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">This verification is valid for {tokenRemainingLabel}</p>
                            )}
                            {tokenExpired && (
                                <p className="text-sm text-rose-600 dark:text-rose-400">This verification has expired. Please start over.</p>
                            )}

                            {!tokenExpired && (
                                <>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                            New Code (6 digits)
                                        </label>
                                        <input
                                            type="password"
                                            inputMode="numeric"
                                            value={newCode}
                                            onChange={(e) => setNewCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                            autoFocus
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
                                            onChange={(e) => setConfirmCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                            className="w-full text-center tracking-[0.4em] text-lg rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="••••••"
                                        />
                                    </div>
                                </>
                            )}

                            {(localError || confirmError) && (
                                <p className="text-sm text-rose-600 dark:text-rose-400">{localError || confirmError}</p>
                            )}

                            {!tokenExpired ? (
                                <button
                                    type="button"
                                    onClick={handleConfirmReset}
                                    disabled={confirming}
                                    className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-60"
                                >
                                    {confirming ? "Resetting..." : "Reset Code"}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                >
                                    Start Over
                                </button>
                            )}
                        </div>
                    )}

                    {step === "done" && (
                        <div className="space-y-4 text-center">
                            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                                Your secure code has been reset. Use your new code the next time you clock in.
                            </p>
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700"
                            >
                                Done
                            </button>
                        </div>
                    )}
                </div>

                {step !== "done" && (
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={sending || verifying || confirming}
                            className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:underline disabled:opacity-60"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
