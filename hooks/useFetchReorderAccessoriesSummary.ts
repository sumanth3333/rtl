"use client";

import { useEffect, useState } from "react";
import apiClient from "@/services/api/apiClient";
import { StoreReorderSummary } from "@/types/accessoriesReorderSummaryTypes";

interface OverallItem {
    productName: string;
    caseQuantity: number;
    glassQuantity: number
}

export const useFetchReorderAccessoriesSummary = (companyName: string) => {
    const [data, setData] = useState<StoreReorderSummary[]>([]);
    const [overallReorderSummary, setOverallReorderSummary] = useState<OverallItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!companyName) return;

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await apiClient.get("/company/accessoryReorderSummary", {
                    params: { companyName },
                });

                const {
                    reorderSummaryForStores,
                    overallReorderSummary,
                } = response.data;

                if (!Array.isArray(reorderSummaryForStores)) {
                    throw new Error("Invalid API response");
                }

                setData(reorderSummaryForStores);
                setOverallReorderSummary(overallReorderSummary || []);
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
        isLoading,
        error,
    };
};
