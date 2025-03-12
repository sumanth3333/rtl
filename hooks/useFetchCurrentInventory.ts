"use client";

import { useEffect, useState } from "react";
import apiClient from "@/services/api/apiClient";
import { StoreCurrentStock } from "@/types/currentInventoryTypes";

export const useFetchCurrentInventory = (companyName: string) => {
    const [data, setData] = useState<StoreCurrentStock[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!companyName) return;

        const fetchData = async () => {
            try {
                const response = await apiClient.get(`/company/viewCurrentStock`, {
                    params: { companyName },
                });

                if (!Array.isArray(response.data)) {
                    throw new Error("Invalid API response format");
                }

                setData(response.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to fetch current inventory.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [companyName]);

    return { data, isLoading, error };
};
