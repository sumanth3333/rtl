"use client";

import { useCallback, useState } from "react";
import { ApiError } from "@/services/api/errorHandler";
import {
    sendSecureCodeResetOtp,
    verifySecureCodeResetOtp,
    confirmSecureCodeReset,
} from "@/services/employee/employeeService";

export type SecureCodeResetStep = "idle" | "awaiting-otp" | "awaiting-new-code" | "done";

// ✅ send-otp -> verify-otp (returns a short-lived resetToken) -> confirm, mirrors the
// clock-in setup/verify modals but for the "forgot my secure code" path.
export function useSecureCodeReset(employeeNtid: string) {
    const [step, setStep] = useState<SecureCodeResetStep>("idle");

    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);
    const [otpExpiresAt, setOtpExpiresAt] = useState<number | null>(null);

    const [verifying, setVerifying] = useState(false);
    const [verifyError, setVerifyError] = useState<string | null>(null);
    const [resetToken, setResetToken] = useState<string | null>(null);
    const [resetTokenExpiresAt, setResetTokenExpiresAt] = useState<number | null>(null);

    const [confirming, setConfirming] = useState(false);
    const [confirmError, setConfirmError] = useState<string | null>(null);

    const reset = useCallback(() => {
        setStep("idle");
        setSending(false);
        setSendError(null);
        setOtpExpiresAt(null);
        setVerifying(false);
        setVerifyError(null);
        setResetToken(null);
        setResetTokenExpiresAt(null);
        setConfirming(false);
        setConfirmError(null);
    }, []);

    const sendOtp = useCallback(async () => {
        setSending(true);
        setSendError(null);
        try {
            const result = await sendSecureCodeResetOtp(employeeNtid);
            setOtpExpiresAt(Date.now() + result.otpValiditySeconds * 1000);
            setStep("awaiting-otp");
        } catch (error) {
            setSendError(error instanceof ApiError ? error.message : "Failed to send verification code.");
        } finally {
            setSending(false);
        }
    }, [employeeNtid]);

    const verifyOtp = useCallback(async (otp: string) => {
        setVerifying(true);
        setVerifyError(null);
        try {
            const result = await verifySecureCodeResetOtp(employeeNtid, otp);
            setResetToken(result.resetToken);
            setResetTokenExpiresAt(Date.now() + result.resetTokenValiditySeconds * 1000);
            setStep("awaiting-new-code");
        } catch (error) {
            setVerifyError(error instanceof ApiError ? error.message : "Failed to verify the code. Please try again.");
        } finally {
            setVerifying(false);
        }
    }, [employeeNtid]);

    const confirmReset = useCallback(async (newSecureCode: string) => {
        if (!resetToken) { return; }
        setConfirming(true);
        setConfirmError(null);
        try {
            await confirmSecureCodeReset(employeeNtid, resetToken, newSecureCode);
            setStep("done");
        } catch (error) {
            setConfirmError(error instanceof ApiError ? error.message : "Failed to reset your secure code. Please try again.");
        } finally {
            setConfirming(false);
        }
    }, [employeeNtid, resetToken]);

    return {
        step,

        sending,
        sendError,
        otpExpiresAt,
        sendOtp,

        verifying,
        verifyError,
        resetTokenExpiresAt,
        verifyOtp,

        confirming,
        confirmError,
        confirmReset,

        reset,
    };
}
