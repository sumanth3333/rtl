"use client";

import { useEffect, useState } from "react";
import { StoreReorderSummary } from "@/types/reorderSummaryTypes";
import apiClient from "@/services/api/apiClient";

export const useFetchReorderSummary = (companyName: string) => {
    const [data, setData] = useState<StoreReorderSummary[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null); // ✅ Change error type to Error | null

    useEffect(() => {
        if (!companyName) return;

        const fetchData = async () => {
            try {
                const response = await apiClient.get(`/company/reorderSummary`, {
                    params: { companyName },
                });

                console.log("Reorder data:", response);

                if (!Array.isArray(response.data)) {
                    throw new Error("Invalid API response format");
                }

                setData(response.data);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err); // ✅ Store the error object itself
                } else {
                    setError(new Error("Unknown error occurred"));
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [companyName]);

    return { data, isLoading, error };
};
