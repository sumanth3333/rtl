"use client";

import { useState, useEffect } from "react";
import { useEmployee } from "@/hooks/useEmployee";
import { fetchTransfersAPI } from "@/services/upgrades/transferService";

export const useFetchTransfersAndReceives = () => {
    const { store } = useEmployee();
    const [transfers, setTransfers] = useState<any[]>([]);
    const [receives, setReceives] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!store?.dealerStoreId) {return;}

        const fetchData = async () => {
            setIsLoading(true);
            try {
                console.log("Fetching transfers and receives...");
                const transfersData = await fetchTransfersAPI(store.dealerStoreId);
                setTransfers(transfersData.pendingTransfers);
                setReceives(transfersData.pendingReceives);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to fetch transfers.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [store?.dealerStoreId]);

    return { transfers, receives, setReceives, isLoading, error };
};
