import { useEffect, useState } from "react";
import apiClient from "@/services/api/apiClient";
import { OverallProductInventory, StoreCurrentStock } from "@/types/currentAccessoryTypes";

export const useFetchCurrentInventory = (companyName: string) => {
    const [data, setData] = useState<StoreCurrentStock[]>([]);
    const [overallInventory, setOverallInventory] = useState<OverallProductInventory[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!companyName) return;

        const fetchData = async () => {
            try {
                const response = await apiClient.get(`/company/viewAccessoryCurrentStock`, {
                    params: { companyName },
                });
                console.log(response.data);
                setData(response.data.storesStockDetails);
                setOverallInventory(response.data.overallCurrentinventory || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to fetch current inventory.");
            } finally {
                setIsLoading(false);
            }
        };
        console.log(data);
        fetchData();
    }, [companyName]);

    return { data, isLoading, error, overallInventory };
};
