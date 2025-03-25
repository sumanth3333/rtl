import { useEffect, useState } from "react";
import apiClient from "@/services/api/apiClient";
import { StoreCurrentStock, OverallProductInventory } from "@/types/currentInventoryTypes";

export const useFetchCurrentInventory = (companyName: string) => {
    const [data, setData] = useState<StoreCurrentStock[]>([]);
    const [overallInventory, setOverallInventory] = useState<OverallProductInventory[]>([]);
    const [overallStockValue, setOverallStockValue] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!companyName) return;

        const fetchData = async () => {
            try {
                const response = await apiClient.get(`/company/viewCurrentStock`, {
                    params: { companyName },
                });

                setData(response.data.storesStockDetails);
                setOverallInventory(response.data.overallCurrentinventory || []);
                setOverallStockValue(response.data.overallCurrentStockValue || 0);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to fetch current inventory.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [companyName]);

    return { data, isLoading, error, overallInventory, overallStockValue };
};
