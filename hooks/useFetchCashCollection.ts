"use client";

import { fetchCashCollectionAPI } from "@/services/owner/cashCollectionService";
import { CashCollectionData } from "@/types/cashCollectionTypes";
import { useState, useEffect } from "react";

export const useFetchCashCollection = (companyName: string, startDate: string, endDate: string, dealerStoreId: string) => {
    const [cashData, setCashData] = useState<CashCollectionData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!companyName || !startDate || !endDate) {
            setCashData([]); // ✅ Prevents undefined access
            return;
        }

        const fetchData = async () => {
            try {
                const data = await fetchCashCollectionAPI(companyName, startDate, endDate, dealerStoreId);
                setCashData(Array.isArray(data) ? data : []); // ✅ Ensure array
            } catch (err) {
                setError("Failed to fetch cash collection data.");
                setCashData([]); // ✅ Set empty array on error
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [companyName, startDate, endDate, dealerStoreId]);

    return { cashData, isLoading, error };
};
