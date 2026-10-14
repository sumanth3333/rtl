"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/services/api/errorHandler";
import {
    getCredentialStatus,
    saveCompanyCredentials,
    updateCompanyCredentials,
    deleteCompanyCredentials,
    requestViewOtp,
    verifyViewOtp,
} from "@/services/owner/companyCredentialService";
import { useGeolocation, GeolocationFailure } from "@/hooks/useGeolocation";

export type OtpStep = "idle" | "locating" | "awaiting-otp" | "revealed";
export type OtpErrorKind = "wrong" | "locked" | "expired" | "no-active" | "malformed" | "generic";

export interface OtpError {
    kind: OtpErrorKind;
    message: string;
}

const OTP_TTL_MS = 5 * 60 * 1000;

const classifyOtpError = (message: string): OtpErrorKind => {
    const m = message.toLowerCase();
    if (m.includes("maximum verification attempts")) { return "locked"; }
    if (m.includes("expired")) { return "expired"; }
    if (m.includes("no active verification code")) { return "no-active"; }
    if (m.includes("exactly 6 digits")) { return "malformed"; }
    if (m.includes("invalid verification code")) { return "wrong"; }
    return "generic";
};

// ✅ Centralizes status/save/update/delete and the location -> request-otp -> verify-otp reveal flow.
// Revealed username/password live only in this hook's state - never persisted, cleared on unmount (route change/logout).
export function useCompanyCredentials(companyName: string) {
    const [statusLoading, setStatusLoading] = useState(true);
    const [credentialsConfigured, setCredentialsConfigured] = useState<boolean | null>(null);
    const [statusError, setStatusError] = useState<string | null>(null);

    const [saving, setSaving] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const { requestLocation, locating } = useGeolocation();
    const [locationError, setLocationError] = useState<GeolocationFailure | null>(null);

    const [otpStep, setOtpStep] = useState<OtpStep>("idle");
    const [otpRequesting, setOtpRequesting] = useState(false);
    const [otpVerifying, setOtpVerifying] = useState(false);
    const [otpRequestError, setOtpRequestError] = useState<string | null>(null);
    const [otpError, setOtpError] = useState<OtpError | null>(null);
    const [otpRequestedAt, setOtpRequestedAt] = useState<number | null>(null);
    const [otpExpiresAt, setOtpExpiresAt] = useState<number | null>(null);

    const [revealedUsername, setRevealedUsername] = useState<string | undefined>(undefined);
    const [revealedPassword, setRevealedPassword] = useState<string | undefined>(undefined);

    const clearReveal = useCallback(() => {
        setRevealedUsername(undefined);
        setRevealedPassword(undefined);
        setOtpStep("idle");
        setOtpError(null);
        setOtpRequestError(null);
        setOtpRequestedAt(null);
        setOtpExpiresAt(null);
        setLocationError(null);
    }, []);

    // ✅ Unmount covers both "route changes" and "page becomes stale" - this card is torn down in either case
    useEffect(() => () => {
        setRevealedUsername(undefined);
        setRevealedPassword(undefined);
    }, []);

    const refreshStatus = useCallback(async () => {
        if (!companyName) { return; }
        setStatusLoading(true);
        setStatusError(null);
        try {
            const status = await getCredentialStatus(companyName);
            setCredentialsConfigured(status.credentialsConfigured);
        } catch (error) {
            // 404 means "no credential record yet" per the API's error matrix - treat as empty state, not a failure
            if (error instanceof ApiError && error.status === 404) {
                setCredentialsConfigured(false);
            } else {
                setStatusError(error instanceof ApiError ? error.message : "Failed to load credential status.");
            }
        } finally {
            setStatusLoading(false);
        }
    }, [companyName]);

    useEffect(() => {
        refreshStatus();
    }, [refreshStatus]);

    const save = useCallback(async (username: string, password: string) => {
        setSaving(true);
        try {
            await saveCompanyCredentials({ companyName, username, password });
            await refreshStatus();
        } catch (error) {
            // 409 means credentials already exist - the UI should still end up showing the configured state
            if (error instanceof ApiError && error.status === 409) {
                await refreshStatus();
            }
            throw error;
        } finally {
            setSaving(false);
        }
    }, [companyName, refreshStatus]);

    const update = useCallback(async (username?: string, password?: string) => {
        setUpdating(true);
        try {
            await updateCompanyCredentials({ companyName, username, password });
            await refreshStatus();
            clearReveal(); // backend invalidates any active OTP on update
        } finally {
            setUpdating(false);
        }
    }, [companyName, refreshStatus, clearReveal]);

    const remove = useCallback(async () => {
        setDeleting(true);
        try {
            await deleteCompanyCredentials(companyName);
            setCredentialsConfigured(false);
            clearReveal();
        } catch (error) {
            // 404 means there was nothing to delete - treat as already in the empty state, not a hard failure
            if (error instanceof ApiError && error.status === 404) {
                setCredentialsConfigured(false);
                clearReveal();
                return;
            }
            throw error;
        } finally {
            setDeleting(false);
        }
    }, [companyName, clearReveal]);

    const startViewFlow = useCallback(async () => {
        setOtpStep("locating");
        setLocationError(null);
        setOtpRequestError(null);

        let coords;
        try {
            coords = await requestLocation();
        } catch (failure) {
            setOtpStep("idle");
            setLocationError(failure as GeolocationFailure);
            return;
        }

        setOtpRequesting(true);
        try {
            await requestViewOtp({ companyName, latitude: coords.latitude, longitude: coords.longitude });
            const now = Date.now();
            setOtpRequestedAt(now);
            setOtpExpiresAt(now + OTP_TTL_MS);
            setOtpError(null);
            setOtpStep("awaiting-otp");
        } catch (error) {
            // Do not open the OTP step as if it succeeded (e.g. email delivery failure)
            setOtpStep("idle");
            setOtpRequestError(error instanceof ApiError ? error.message : "Failed to send verification code.");
        } finally {
            setOtpRequesting(false);
        }
    }, [companyName, requestLocation]);

    const verifyOtp = useCallback(async (otp: string) => {
        setOtpVerifying(true);
        setOtpError(null);
        try {
            const result = await verifyViewOtp({ companyName, otp });
            setRevealedUsername(result.username);
            setRevealedPassword(result.password);
            setOtpStep("revealed");
        } catch (error) {
            const message = error instanceof ApiError ? error.message : "Failed to verify code.";
            setOtpError({ kind: classifyOtpError(message), message });
        } finally {
            setOtpVerifying(false);
        }
    }, [companyName]);

    return {
        statusLoading,
        credentialsConfigured,
        statusError,
        refreshStatus,

        saving,
        save,
        updating,
        update,
        deleting,
        remove,

        locating,
        locationError,
        otpStep,
        otpRequesting,
        otpVerifying,
        otpRequestError,
        otpError,
        otpRequestedAt,
        otpExpiresAt,
        startViewFlow,
        verifyOtp,

        revealedUsername,
        revealedPassword,
        clearReveal,
    };
}
