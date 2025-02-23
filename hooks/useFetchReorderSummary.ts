"use client";

import { useEffect, useState } from "react";
import { ReorderSummaryData } from "@/types/reorderSummaryTypes";
import apiClient from "@/services/api/apiClient";

export const useFetchReorderSummary = (companyName: string) => {
    const [data, setData] = useState<ReorderSummaryData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!companyName) {return;}

        const fetchData = async () => {
            try {
                const response = await apiClient.get(`/company/reorderSummary`, {
                    params: { companyName },
                });
                console.log(response.data);
                if (!Array.isArray(response.data)) {
                    throw new Error("Invalid API response format");
                }

                setData(response.data);
            } catch (err) {
                setError("Failed to fetch reorder summary.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [companyName]);

    return { data, isLoading, error };
};
