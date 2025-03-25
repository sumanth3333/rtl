"use client";

import { useEffect, useState } from "react";
import apiClient from "@/services/api/apiClient";
import { StoreReorderSummary } from "@/types/reorderSummaryTypes";

interface OverallItem {
    productName: string;
    currentQuantity: number;
}

export const useFetchReorderSummary = (companyName: string) => {
    const [data, setData] = useState<StoreReorderSummary[]>([]);
    const [overallReorderSummary, setOverallReorderSummary] = useState<OverallItem[]>([]);
    const [overallReorderValue, setOverallReorderValue] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!companyName) return;

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await apiClient.get("/company/reorderSummary", {
                    params: { companyName },
                });

                const {
                    reorderSummaryForStores,
                    overallReorderSummary,
                    overallReorderValue,
                } = response.data;

                if (!Array.isArray(reorderSummaryForStores)) {
                    throw new Error("Invalid API response");
                }

                setData(reorderSummaryForStores);
                setOverallReorderSummary(overallReorderSummary || []);
                setOverallReorderValue(overallReorderValue || 0);
            } catch (err) {
                setError(err instanceof Error ? err : new Error("Failed to fetch reorder summary"));
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [companyName]);

    return {
        data,
        overallReorderSummary,
        overallReorderValue,
        isLoading,
        error,
    };
};
