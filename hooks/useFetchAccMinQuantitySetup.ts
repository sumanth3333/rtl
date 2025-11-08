"use client";

import { useEffect, useState } from "react";
import apiClient from "@/services/api/apiClient";
import { StoreAccessoriesMinQuantitySetup } from "@/types/minQuantityTypes";

export const useFetchMinQuantitySetup = (companyName: string) => {
    const [data, setData] = useState<StoreAccessoriesMinQuantitySetup[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!companyName) return;

        const fetchData = async () => {
            try {
                const response = await apiClient.get(`/company/getAllAccessoryWithMinimumSetup`, {
                    params: { companyName },
                });

                if (!Array.isArray(response.data)) {
                    throw new Error("Invalid API response format");
                }

                setData(response.data);
            } catch (err) {
                setError("Failed to fetch minimum quantity setup.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [companyName]);

    return { data, isLoading, error };
};
