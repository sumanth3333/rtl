"use client";

import { useCallback, useState } from "react";
import { ApiError } from "@/services/api/errorHandler";
import { getCurrentContactDetails } from "@/services/employee/contactVerificationService";
import { CurrentContactDetails } from "@/types/contactVerificationTypes";

// ✅ Secure-code gated lookup of the employee's currently saved email/phone and whether
// each is verified - kept separate from useContactVerification's update flow.
export function useContactDetails(employeeNtid: string) {
    const [details, setDetails] = useState<CurrentContactDetails | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDetails = useCallback(async (secureCode: string) => {
        setLoading(true);
        setError(null);
        try {
            const result = await getCurrentContactDetails(employeeNtid, secureCode);
            setDetails(result);
            return result;
        } catch (err) {
            setError(err instanceof ApiError ? err.message : "Failed to load your contact details. Please try again.");
            throw err;
        } finally {
            setLoading(false);
        }
    }, [employeeNtid]);

    const clear = useCallback(() => {
        setDetails(null);
        setError(null);
    }, []);

    return { details, loading, error, fetchDetails, clear };
}
