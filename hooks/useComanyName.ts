"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchCompanyNameByNtid } from "@/services/employee/employeeService";

type UseCompanyNameOpts = {
    employeeNtid?: string | null;
    storageKey?: string;
};

export function useCompanyName({
    employeeNtid,
    storageKey = "companyName",
}: UseCompanyNameOpts) {
    const [companyName, setCompanyName] = useState<string | undefined>(() => {

        if (typeof window !== "undefined") {
            const ls = localStorage.getItem(storageKey);
            if (ls && ls.trim().length > 0) return ls;
        }
        return undefined;
    });

    const [loading, setLoading] = useState<boolean>(() => !companyName);
    const [error, setError] = useState<string | null>(null);

    // Only fetch when we don't already have a companyName and we have an NTID
    useEffect(() => {
        let isMounted = true;
        async function run() {
            if (companyName || !employeeNtid) {
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                const data = await fetchCompanyNameByNtid(employeeNtid);
                const resolved =
                    typeof data === "string"
                        ? data
                        : (data?.companyName as string | undefined);

                if (isMounted && resolved && resolved.trim().length > 0) {
                    setCompanyName(resolved);
                    if (typeof window !== "undefined") {
                        localStorage.setItem(storageKey, resolved);
                    }
                }
            } catch (e: any) {
                if (isMounted) {
                    setError(e?.message || "Failed to fetch company name");
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        }
        run();
        return () => {
            isMounted = false;
        };
    }, [employeeNtid, companyName, storageKey]);

    return useMemo(
        () => ({ companyName, loading, error }),
        [companyName, loading, error]
    );
}
