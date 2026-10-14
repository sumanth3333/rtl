"use client";

import { useContext, useEffect, useState } from "react";
import { Mail, MessageCircle, CheckCircle2, ShieldCheck, ShieldAlert, Lock } from "lucide-react";
import { EmployeeContext } from "@/contexts/EmployeeContext";
import { useContactDetails } from "@/hooks/useContactDetails";
import { useContactVerification } from "@/hooks/useContactVerification";
import { WhatsappDeliveryStatus } from "@/types/contactVerificationTypes";

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isValidPhone = (value: string) => /^\d{10,15}$/.test(value);

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

const statusCopy: Record<WhatsappDeliveryStatus, string> = {
    PENDING: "Verification is pending.",
    SENT: "Message was sent.",
    DELIVERED: "Message was delivered.",
    READ: "Message was read.",
    FAILED: "Message failed to deliver.",
    VERIFIED: "Code verified successfully.",
};

export default function ContactVerificationSettings() {
    const { employee } = useContext(EmployeeContext);
    const employeeNtid = employee?.employeeNtid ?? "";

    const { details, loading: loadingDetails, error: detailsError, fetchDetails, clear: clearDetails } = useContactDetails(employeeNtid);
    const [unlockCode, setUnlockCode] = useState("");
    const [savedSecureCode, setSavedSecureCode] = useState("");
    const [showUpdateFlow, setShowUpdateFlow] = useState(false);

    const {
        step,
        pendingEmail, pendingPhone, emailRequested, phoneRequested, otpExpiresAt,
        sending, sendError, submitContactChange, resendOtp,
        emailVerified, verifyingEmail, emailVerifyError, verifyEmail,
        phoneVerified, verifyingPhone, phoneVerifyError, verifyPhone,
        checkingStatus, statusError, whatsappStatus, checkWhatsappStatus,
        canConfirm, confirming, confirmError, confirm,
        resetAll,
    } = useContactVerification(employeeNtid);

    const [newEmail, setNewEmail] = useState("");
    const [newPhone, setNewPhone] = useState("");
    const [formError, setFormError] = useState<string | null>(null);

    const [emailOtp, setEmailOtp] = useState("");
    const [phoneOtp, setPhoneOtp] = useState("");

    const [showStatusCheck, setShowStatusCheck] = useState(false);
    const [secureCode, setSecureCode] = useState("");

    const remainingMs = useCountdown(otpExpiresAt);
    const expired = step === "verify" && otpExpiresAt !== null && remainingMs <= 0;
    const remainingLabel = `${Math.floor(remainingMs / 60000)}:${String(Math.floor((remainingMs % 60000) / 1000)).padStart(2, "0")}`;

    const handleUnlock = async () => {
        if (unlockCode.length !== 6) { return; }
        try {
            await fetchDetails(unlockCode);
            setSavedSecureCode(unlockCode);
            setUnlockCode("");
            setNewEmail("");
            setNewPhone("");
        } catch {
            // error surfaced via detailsError
        }
    };

    const refreshDetails = async () => {
        if (!savedSecureCode) { return; }
        try {
            await fetchDetails(savedSecureCode);
        } catch {
            // error surfaced via detailsError - stale details stay visible rather than disappearing
        }
    };

    const handleSubmitForm = () => {
        const email = newEmail.trim();
        const phone = newPhone.trim();

        if (!email && !phone) {
            setFormError("Enter a new email, a new WhatsApp number, or both.");
            return;
        }
        if (email && !isValidEmail(email)) {
            setFormError("Enter a valid email address.");
            return;
        }
        if (phone && !isValidPhone(phone)) {
            setFormError("Phone number must be 10-15 digits.");
            return;
        }

        if (!savedSecureCode) {
            setFormError("Your session expired. Please re-enter your secure code.");
            return;
        }

        setFormError(null);
        submitContactChange(savedSecureCode, email || undefined, phone || undefined);
    };

    const handleResend = () => {
        setEmailOtp("");
        setPhoneOtp("");
        setShowStatusCheck(false);
        setSecureCode("");
        resendOtp();
    };

    const handleCancelUpdate = () => {
        setNewEmail("");
        setNewPhone("");
        setEmailOtp("");
        setPhoneOtp("");
        setShowStatusCheck(false);
        setSecureCode("");
        setFormError(null);
        resetAll();
        setShowUpdateFlow(false);
    };

    const handleDoneReturnToDetails = async () => {
        await refreshDetails();
        resetAll();
        setShowUpdateFlow(false);
    };

    const handleCheckStatus = () => {
        if (secureCode.length !== 6) { return; }
        checkWhatsappStatus(secureCode);
    };

    const handleLock = () => {
        clearDetails();
        setSavedSecureCode("");
        setShowUpdateFlow(false);
        resetAll();
    };

    // ✅ Verify the already-saved email/phone as-is - no new value to type, just (re)send an
    // OTP to the existing value and walk straight into the verify step.
    const handleVerifyExisting = (channel: "email" | "phone") => {
        if (!details || !savedSecureCode) { return; }
        setShowUpdateFlow(true);
        if (channel === "email") {
            submitContactChange(savedSecureCode, details.email, undefined);
        } else {
            submitContactChange(savedSecureCode, undefined, details.phoneNumber);
        }
    };

    // ✅ Secure-code gate - the API itself requires it to return current contact details
    if (!details) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Lock className="w-4 h-4 text-gray-400" />
                    Enter your secure code to view your contact details.
                </div>
                <input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    value={unlockCode}
                    onChange={(e) => setUnlockCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="••••••"
                    className="w-full text-center tracking-[0.4em] text-lg rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {detailsError && (
                    <p className="text-sm text-rose-600 dark:text-rose-400">{detailsError}</p>
                )}
                <button
                    type="button"
                    onClick={handleUnlock}
                    disabled={unlockCode.length !== 6 || loadingDetails || !employeeNtid}
                    className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-60"
                >
                    {loadingDetails ? "Checking..." : "View Contact Details"}
                </button>
            </div>
        );
    }

    if (!showUpdateFlow) {
        return (
            <div className="space-y-4">
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                            <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                            <p className="text-sm text-gray-700 dark:text-gray-200 truncate">{details.email}</p>
                        </div>
                        {details.emailVerified ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 shrink-0">
                                <ShieldCheck className="w-3.5 h-3.5" /> Verified
                            </span>
                        ) : (
                            <div className="flex items-center gap-2 shrink-0">
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                                    <ShieldAlert className="w-3.5 h-3.5" /> Not Verified
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleVerifyExisting("email")}
                                    className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    Verify
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                            <MessageCircle className="w-4 h-4 text-gray-400 shrink-0" />
                            <p className="text-sm text-gray-700 dark:text-gray-200 truncate">{details.phoneNumber}</p>
                        </div>
                        {details.phoneNumberVerified ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 shrink-0">
                                <ShieldCheck className="w-3.5 h-3.5" /> Verified
                            </span>
                        ) : (
                            <div className="flex items-center gap-2 shrink-0">
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                                    <ShieldAlert className="w-3.5 h-3.5" /> Not Verified
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleVerifyExisting("phone")}
                                    className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    Verify
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => setShowUpdateFlow(true)}
                        className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                        Update Contact Info
                    </button>
                    <button
                        type="button"
                        onClick={handleLock}
                        className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        Done
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {step === "form" && sending && (
                <p className="text-sm text-gray-600 dark:text-gray-300 text-center py-4">Sending verification code...</p>
            )}

            {step === "form" && !sending && (
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Update your email and/or WhatsApp number. We&apos;ll send a verification code to each
                        channel you change, and nothing is saved until both are confirmed.
                    </p>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            New Email
                        </label>
                        <input
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder={details.email}
                            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            New WhatsApp Number
                        </label>
                        <input
                            type="tel"
                            inputMode="numeric"
                            value={newPhone}
                            onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, "").slice(0, 15))}
                            placeholder={details.phoneNumber}
                            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {(formError || sendError) && (
                        <p className="text-sm text-rose-600 dark:text-rose-400">{formError || sendError}</p>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleSubmitForm}
                            disabled={sending || !employeeNtid}
                            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-60"
                        >
                            {sending ? "Sending..." : "Send Verification Code(s)"}
                        </button>
                        <button
                            type="button"
                            onClick={handleCancelUpdate}
                            disabled={sending}
                            className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-60"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {step === "verify" && (
                <div className="space-y-5">
                    {!expired ? (
                        <p className="text-xs text-gray-500 dark:text-gray-400">Codes expire in {remainingLabel}</p>
                    ) : (
                        <p className="text-sm text-rose-600 dark:text-rose-400">Verification codes have expired. Please request new ones.</p>
                    )}

                    {emailRequested && (
                        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{pendingEmail}</p>
                                {emailVerified && <CheckCircle2 className="w-4 h-4 text-emerald-600 ml-auto" />}
                            </div>

                            {!emailVerified && !expired && (
                                <>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        value={emailOtp}
                                        onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                        placeholder="••••••"
                                        className="w-full text-center tracking-[0.4em] text-lg rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {emailVerifyError && (
                                        <p className="text-sm text-rose-600 dark:text-rose-400">{emailVerifyError}</p>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => verifyEmail(emailOtp)}
                                        disabled={emailOtp.length !== 6 || verifyingEmail}
                                        className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-60"
                                    >
                                        {verifyingEmail ? "Verifying..." : "Verify Email"}
                                    </button>
                                </>
                            )}

                            {emailVerified && (
                                <p className="text-sm text-emerald-600 dark:text-emerald-400">Email verified.</p>
                            )}
                        </div>
                    )}

                    {phoneRequested && (
                        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                            <div className="flex items-center gap-2">
                                <MessageCircle className="w-4 h-4 text-gray-400" />
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{pendingPhone}</p>
                                {phoneVerified && <CheckCircle2 className="w-4 h-4 text-emerald-600 ml-auto" />}
                            </div>

                            {!phoneVerified && !expired && (
                                <>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        value={phoneOtp}
                                        onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                        placeholder="••••••"
                                        className="w-full text-center tracking-[0.4em] text-lg rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {phoneVerifyError && (
                                        <p className="text-sm text-rose-600 dark:text-rose-400">{phoneVerifyError}</p>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => verifyPhone(phoneOtp)}
                                        disabled={phoneOtp.length !== 6 || verifyingPhone}
                                        className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-60"
                                    >
                                        {verifyingPhone ? "Verifying..." : "Verify WhatsApp Code"}
                                    </button>

                                    {whatsappStatus && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{statusCopy[whatsappStatus]}</p>
                                    )}

                                    {!showStatusCheck ? (
                                        <button
                                            type="button"
                                            onClick={() => setShowStatusCheck(true)}
                                            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                                        >
                                            Didn&apos;t get it? Check delivery status
                                        </button>
                                    ) : (
                                        <div className="space-y-2 pt-1 border-t border-gray-100 dark:border-gray-800">
                                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                Enter your secure code to check delivery status
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="password"
                                                    inputMode="numeric"
                                                    maxLength={6}
                                                    value={secureCode}
                                                    onChange={(e) => setSecureCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                                    placeholder="••••••"
                                                    className="flex-1 text-center tracking-[0.3em] rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleCheckStatus}
                                                    disabled={secureCode.length !== 6 || checkingStatus}
                                                    className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-60"
                                                >
                                                    {checkingStatus ? "Checking..." : "Check Status"}
                                                </button>
                                            </div>
                                            {statusError && (
                                                <p className="text-xs text-rose-600 dark:text-rose-400">{statusError}</p>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}

                            {phoneVerified && (
                                <p className="text-sm text-emerald-600 dark:text-emerald-400">WhatsApp number verified.</p>
                            )}
                        </div>
                    )}

                    {confirmError && (
                        <p className="text-sm text-rose-600 dark:text-rose-400">{confirmError}</p>
                    )}

                    <div className="flex gap-3">
                        {!expired ? (
                            <button
                                type="button"
                                onClick={confirm}
                                disabled={!canConfirm || confirming}
                                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-60"
                            >
                                {confirming ? "Saving..." : "Confirm Changes"}
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleResend}
                                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700"
                            >
                                Request New Codes
                            </button>
                        )}
                        {!expired && (
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={sending}
                                className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-60"
                            >
                                Resend
                            </button>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={handleCancelUpdate}
                        className="w-full text-sm font-medium text-gray-500 dark:text-gray-400 hover:underline"
                    >
                        Cancel
                    </button>
                </div>
            )}

            {step === "done" && (
                <div className="space-y-4 text-center py-4">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                        Your contact information has been updated.
                    </p>
                    <button
                        type="button"
                        onClick={handleDoneReturnToDetails}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        Back to Contact Details
                    </button>
                </div>
            )}
        </div>
    );
}
