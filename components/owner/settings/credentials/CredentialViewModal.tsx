"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, Eye, EyeOff, Check } from "lucide-react";
import { GeolocationFailure } from "@/hooks/useGeolocation";
import { OtpError, OtpStep } from "@/hooks/useCompanyCredentials";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onStart: () => void;
    otpStep: OtpStep;
    locating: boolean;
    locationError: GeolocationFailure | null;
    otpRequesting: boolean;
    otpRequestError: string | null;
    otpVerifying: boolean;
    otpError: OtpError | null;
    otpExpiresAt: number | null;
    onVerify: (otp: string) => void;
    revealedUsername?: string;
    revealedPassword?: string;
}

const locationErrorCopy: Record<GeolocationFailure["kind"], string> = {
    unsupported: "Your browser doesn't support location access, which this feature requires.",
    "permission-denied": "Location permission is needed to request a verification code. Please allow access and try again.",
    timeout: "Getting your location timed out.",
    unavailable: "Your location is currently unavailable.",
};

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

export default function CredentialViewModal({
    isOpen,
    onClose,
    onStart,
    otpStep,
    locating,
    locationError,
    otpRequesting,
    otpRequestError,
    otpVerifying,
    otpError,
    otpExpiresAt,
    onVerify,
    revealedUsername,
    revealedPassword,
}: Props) {
    const [otp, setOtp] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [copiedField, setCopiedField] = useState<"username" | "password" | null>(null);
    const hasStarted = useRef(false);

    const remainingMs = useCountdown(otpExpiresAt);
    const remainingLabel = `${Math.floor(remainingMs / 60000)}:${String(Math.floor((remainingMs % 60000) / 1000)).padStart(2, "0")}`;
    const otpTimedOut = otpStep === "awaiting-otp" && otpExpiresAt !== null && remainingMs <= 0;

    // ✅ Clicking "View Credentials" kicks off location -> request-otp immediately, no extra click
    useEffect(() => {
        if (isOpen && !hasStarted.current) {
            hasStarted.current = true;
            onStart();
        }
        if (!isOpen) {
            hasStarted.current = false;
            setOtp("");
            setShowPassword(false);
            setCopiedField(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    if (!isOpen) { return null; }

    const needsNewCode = otpTimedOut || (otpError && ["locked", "expired", "no-active"].includes(otpError.kind));

    const handleVerify = () => {
        if (otp.length !== 6) { return; }
        onVerify(otp);
    };

    const handleCopy = async (field: "username" | "password", value: string) => {
        try {
            await navigator.clipboard.writeText(value);
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 1500);
        } catch {
            // clipboard API unavailable - nothing sensitive is logged, just silently ignore
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">View Company Credentials</h2>
                </div>

                <div className="p-6 space-y-4">
                    {/* Step: locating */}
                    {otpStep === "idle" && locating && !locationError && (
                        <p className="text-sm text-gray-600 dark:text-gray-300">Getting your location...</p>
                    )}

                    {/* Step: location error */}
                    {locationError && (
                        <div className="space-y-3">
                            <p className="text-sm text-rose-600 dark:text-rose-400">
                                {locationErrorCopy[locationError.kind]}
                            </p>
                            <button
                                type="button"
                                onClick={onStart}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                            >
                                {locationError.kind === "permission-denied" ? "Retry Permission" : "Retry"}
                            </button>
                        </div>
                    )}

                    {/* Step: requesting OTP */}
                    {otpStep === "idle" && !locating && !locationError && otpRequesting && (
                        <p className="text-sm text-gray-600 dark:text-gray-300">Sending verification code...</p>
                    )}

                    {/* Step: OTP request failed (e.g. email delivery failure) */}
                    {otpStep === "idle" && !locating && !locationError && !otpRequesting && otpRequestError && (
                        <div className="space-y-3">
                            <p className="text-sm text-rose-600 dark:text-rose-400">{otpRequestError}</p>
                            <button
                                type="button"
                                onClick={onStart}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* Step: enter OTP */}
                    {otpStep === "awaiting-otp" && (
                        <div className="space-y-3">
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                Enter the 6-digit code sent to the company&apos;s registered email.
                            </p>
                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                disabled={!!needsNewCode}
                                placeholder="••••••"
                                className="w-full text-center tracking-[0.5em] text-lg rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                            />

                            {!needsNewCode && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Code expires in {remainingLabel}
                                </p>
                            )}

                            {otpError && (
                                <p className="text-sm text-rose-600 dark:text-rose-400">{otpError.message}</p>
                            )}
                            {otpTimedOut && !otpError && (
                                <p className="text-sm text-rose-600 dark:text-rose-400">
                                    Verification code has expired. Please request a new code.
                                </p>
                            )}

                            <div className="flex gap-3">
                                {!needsNewCode && (
                                    <button
                                        type="button"
                                        onClick={handleVerify}
                                        disabled={otp.length !== 6 || otpVerifying}
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-60"
                                    >
                                        {otpVerifying ? "Verifying..." : "Verify"}
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={onStart}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    {needsNewCode ? "Request New Code" : "Resend Code"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step: revealed */}
                    {otpStep === "revealed" && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Username</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        readOnly
                                        value={revealedUsername ?? ""}
                                        className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleCopy("username", revealedUsername ?? "")}
                                        className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
                                        title="Copy username"
                                    >
                                        {copiedField === "username" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Password</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        readOnly
                                        value={revealedPassword ?? ""}
                                        className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
                                        title={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleCopy("password", revealedPassword ?? "")}
                                        className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
                                        title="Copy password"
                                    >
                                        {copiedField === "password" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
