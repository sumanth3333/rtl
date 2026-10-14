"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useEmployee } from "@/hooks/useEmployee";
import { useLogout } from "@/hooks/useLogout";
import { getSecureCodeStatus } from "@/services/employee/employeeService";
import { submitContactUsRequest } from "@/services/contactUsService";
import { ApiError } from "@/services/api/errorHandler";
import SecureCodeSetupModal from "@/components/employee/SecureCodeSetupModal";
import SecureCodeVerifyModal from "@/components/employee/SecureCodeVerifyModal";
import ContactUsForm from "@/components/contactUs/ContactUsForm";
import MyRequestsList from "@/components/contactUs/MyRequestsList";

export default function EmployeeContactUsPanel({ onCancel }: { onCancel?: () => void }) {
    const { employee } = useEmployee();
    const router = useRouter();
    const logout = useLogout();

    const [checking, setChecking] = useState(true);
    const [needsSetup, setNeedsSetup] = useState(false);
    const [needsVerify, setNeedsVerify] = useState(false);
    const [verifiedCode, setVerifiedCode] = useState<string | null>(null);
    const [statusError, setStatusError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        if (!employee?.employeeNtid) { return; }
        let cancelled = false;
        setChecking(true);
        setStatusError(null);
        getSecureCodeStatus(employee.employeeNtid)
            .then((status) => {
                if (cancelled) { return; }
                if (status.secureCodeSetup) {
                    setNeedsVerify(true);
                } else {
                    setNeedsSetup(true);
                }
            })
            .catch((err) => { if (!cancelled) { setStatusError(err instanceof ApiError ? err.message : "Failed to check your secure code status."); } })
            .finally(() => { if (!cancelled) { setChecking(false); } });
        return () => { cancelled = true; };
    }, [employee?.employeeNtid]);

    if (!employee) {
        return <div className="text-sm text-gray-500 dark:text-gray-400">Loading…</div>;
    }

    return (
        <>
            <div className="mb-5">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Your Previous Requests
                </h3>
                <MyRequestsList employeeNtid={employee.employeeNtid} refreshKey={refreshKey} />
            </div>

            {statusError && (
                <div className="rounded-md bg-rose-100 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
                    {statusError}
                </div>
            )}

            {checking ? (
                <div className="h-40 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 animate-pulse" />
            ) : verifiedCode ? (
                <ContactUsForm
                    requesterLabel={employee.employeeName}
                    requesterSubLabel={employee.employeeNtid}
                    onSubmit={({ concern, severity }) =>
                        submitContactUsRequest({
                            requestedUser: employee.employeeNtid,
                            secureCode: verifiedCode,
                            concern,
                            severity,
                        })
                    }
                    onSubmitted={() => setRefreshKey((k) => k + 1)}
                />
            ) : !statusError ? (
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0e1729] shadow-sm p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    Confirm your secure code to continue.
                </div>
            ) : null}

            {needsSetup && (
                <SecureCodeSetupModal
                    employeeName={employee.employeeName}
                    employeeNtid={employee.employeeNtid}
                    onComplete={() => {
                        setNeedsSetup(false);
                        setNeedsVerify(true);
                    }}
                    onLogout={logout}
                />
            )}

            {needsVerify && !verifiedCode && (
                <SecureCodeVerifyModal
                    employeeName={employee.employeeName}
                    employeeNtid={employee.employeeNtid}
                    title="Confirm Your Secure Code"
                    confirmLabel="Confirm & Continue"
                    onVerified={(code) => {
                        setVerifiedCode(code);
                        setNeedsVerify(false);
                    }}
                    onCancel={onCancel ?? (() => router.back())}
                    onSetupRequired={() => {
                        setNeedsVerify(false);
                        setNeedsSetup(true);
                    }}
                />
            )}
        </>
    );
}
