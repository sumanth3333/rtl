"use client";

import { useCallback, useState } from "react";
import { ApiError } from "@/services/api/errorHandler";
import {
    sendContactVerificationOtp,
    verifyEmailOtp,
    verifyWhatsappOtp,
    getWhatsappVerificationStatus,
    confirmContactVerification,
} from "@/services/employee/contactVerificationService";
import { WhatsappDeliveryStatus } from "@/types/contactVerificationTypes";

export type ContactVerificationStep = "form" | "verify" | "done";

// ✅ email and/or phone, each with its own OTP under one requestId. Neither channel's saved
// value changes until /confirm succeeds, and /confirm requires every requested channel verified.
export function useContactVerification(employeeNtid: string) {
    const [step, setStep] = useState<ContactVerificationStep>("form");

    const [pendingEmail, setPendingEmail] = useState<string | null>(null);
    const [pendingPhone, setPendingPhone] = useState<string | null>(null);
    const [pendingSecureCode, setPendingSecureCode] = useState<string | null>(null);
    const [emailRequested, setEmailRequested] = useState(false);
    const [phoneRequested, setPhoneRequested] = useState(false);

    const [requestId, setRequestId] = useState<string | null>(null);
    const [otpExpiresAt, setOtpExpiresAt] = useState<number | null>(null);

    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);

    const [emailVerified, setEmailVerified] = useState(false);
    const [verifyingEmail, setVerifyingEmail] = useState(false);
    const [emailVerifyError, setEmailVerifyError] = useState<string | null>(null);

    const [phoneVerified, setPhoneVerified] = useState(false);
    const [verifyingPhone, setVerifyingPhone] = useState(false);
    const [phoneVerifyError, setPhoneVerifyError] = useState<string | null>(null);

    const [checkingStatus, setCheckingStatus] = useState(false);
    const [statusError, setStatusError] = useState<string | null>(null);
    const [whatsappStatus, setWhatsappStatus] = useState<WhatsappDeliveryStatus | null>(null);

    const [confirming, setConfirming] = useState(false);
    const [confirmError, setConfirmError] = useState<string | null>(null);

    const resetAll = useCallback(() => {
        setStep("form");
        setPendingEmail(null);
        setPendingPhone(null);
        setPendingSecureCode(null);
        setEmailRequested(false);
        setPhoneRequested(false);
        setRequestId(null);
        setOtpExpiresAt(null);
        setSending(false);
        setSendError(null);
        setEmailVerified(false);
        setVerifyingEmail(false);
        setEmailVerifyError(null);
        setPhoneVerified(false);
        setVerifyingPhone(false);
        setPhoneVerifyError(null);
        setCheckingStatus(false);
        setStatusError(null);
        setWhatsappStatus(null);
        setConfirming(false);
        setConfirmError(null);
    }, []);

    const submitContactChange = useCallback(async (secureCode: string, email?: string, phoneNumber?: string) => {
        setSending(true);
        setSendError(null);
        try {
            const result = await sendContactVerificationOtp(employeeNtid, secureCode, email, phoneNumber);
            setPendingEmail(result.email ?? null);
            setPendingPhone(result.phoneNumber ?? null);
            setPendingSecureCode(secureCode);
            setEmailRequested(Boolean(result.emailOtpSubmitted));
            setPhoneRequested(Boolean(result.whatsappOtpSubmitted));
            setRequestId(result.requestId);
            setOtpExpiresAt(Date.now() + result.otpValiditySeconds * 1000);
            setEmailVerified(false);
            setPhoneVerified(false);
            setEmailVerifyError(null);
            setPhoneVerifyError(null);
            setWhatsappStatus(null);
            setStep("verify");
        } catch (error) {
            setSendError(error instanceof ApiError ? error.message : "Failed to send verification code(s). Please try again.");
        } finally {
            setSending(false);
        }
    }, [employeeNtid]);

    const resendOtp = useCallback(() => {
        if (!pendingSecureCode) { return; }
        submitContactChange(pendingSecureCode, pendingEmail ?? undefined, pendingPhone ?? undefined);
    }, [submitContactChange, pendingSecureCode, pendingEmail, pendingPhone]);

    const verifyEmail = useCallback(async (otp: string) => {
        if (!requestId) { return; }
        setVerifyingEmail(true);
        setEmailVerifyError(null);
        try {
            const result = await verifyEmailOtp(employeeNtid, requestId, otp);
            setEmailVerified(result.emailVerified);
            if (!result.emailVerified) {
                setEmailVerifyError(result.message);
            }
        } catch (error) {
            setEmailVerifyError(error instanceof ApiError ? error.message : "Failed to verify email code.");
        } finally {
            setVerifyingEmail(false);
        }
    }, [employeeNtid, requestId]);

    const verifyPhone = useCallback(async (otp: string) => {
        if (!requestId) { return; }
        setVerifyingPhone(true);
        setPhoneVerifyError(null);
        try {
            const result = await verifyWhatsappOtp(employeeNtid, requestId, otp);
            setPhoneVerified(result.phoneNumberVerified);
            if (result.phoneNumberVerified) {
                setWhatsappStatus("VERIFIED");
            } else {
                setPhoneVerifyError(result.message);
            }
        } catch (error) {
            setPhoneVerifyError(error instanceof ApiError ? error.message : "Failed to verify WhatsApp code.");
        } finally {
            setVerifyingPhone(false);
        }
    }, [employeeNtid, requestId]);

    const checkWhatsappStatus = useCallback(async (secureCode: string) => {
        if (!requestId) { return; }
        setCheckingStatus(true);
        setStatusError(null);
        try {
            const result = await getWhatsappVerificationStatus(employeeNtid, requestId, secureCode);
            setWhatsappStatus(result.whatsappStatus);
            if (result.phoneNumberVerified) {
                setPhoneVerified(true);
            }
        } catch (error) {
            setStatusError(error instanceof ApiError ? error.message : "Failed to check WhatsApp delivery status.");
        } finally {
            setCheckingStatus(false);
        }
    }, [employeeNtid, requestId]);

    const canConfirm = requestId !== null
        && (!emailRequested || emailVerified)
        && (!phoneRequested || phoneVerified)
        && (emailRequested || phoneRequested);

    const confirm = useCallback(async () => {
        if (!requestId || !pendingSecureCode || !canConfirm) { return; }
        setConfirming(true);
        setConfirmError(null);
        try {
            await confirmContactVerification(employeeNtid, requestId, pendingSecureCode);
            setStep("done");
        } catch (error) {
            setConfirmError(error instanceof ApiError ? error.message : "Failed to save your contact changes. Please try again.");
        } finally {
            setConfirming(false);
        }
    }, [employeeNtid, requestId, pendingSecureCode, canConfirm]);

    return {
        step,

        pendingEmail,
        pendingPhone,
        emailRequested,
        phoneRequested,
        otpExpiresAt,

        sending,
        sendError,
        submitContactChange,
        resendOtp,

        emailVerified,
        verifyingEmail,
        emailVerifyError,
        verifyEmail,

        phoneVerified,
        verifyingPhone,
        phoneVerifyError,
        verifyPhone,

        checkingStatus,
        statusError,
        whatsappStatus,
        checkWhatsappStatus,

        canConfirm,
        confirming,
        confirmError,
        confirm,

        resetAll,
    };
}
