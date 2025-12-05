// src/hooks/useCompanyPaychecks.ts
import { useEffect, useState } from "react";
import type { GeneratedEmployeePaychecks } from "@/types/paycheckTypes";
import apiClient from "@/services/api/apiClient";

export function useCompanyPaychecks(month: string, companyName: string) {
    const [data, setData] = useState<GeneratedEmployeePaychecks[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // If these aren’t ready yet, don’t call the API
        if (!month || !companyName) {
            setData(null);
            return;
        }

        const controller = new AbortController();

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await apiClient.get<GeneratedEmployeePaychecks[]>(
                    "/company/viewPayChecks",
                    {
                        params: {
                            month,       // e.g. "2025-10"
                            companyName, // e.g. "Panjaab Enterprises LLC"
                        },
                        signal: controller.signal, // Axios v1+ supports this
                    }
                );

                setData(response.data ?? []);
            } catch (err: any) {
                if (err?.name === "CanceledError" || err?.name === "AbortError") {
                    return;
                }

                console.error("Error loading company paychecks:", err);

                // Axios usually has err.response, err.message
                const message =
                    err?.response?.data?.message ||
                    err?.message ||
                    "Something went wrong while loading paychecks.";

                setError(message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        return () => {
            controller.abort();
        };
    }, [month, companyName]);

    return { data, loading, error };
}
