"use client";

import { useEmployee } from "@/hooks/useEmployee";
import { getAuthorizedStoresAPI } from "@/services/employee/employeeService";
import { useEffect, useState } from "react";

interface Store {
    dealerStoreId: string;
    storeName: string;
}

export const useFetchAuthorizedStores = () => {
    const { employee } = useEmployee();
    const [stores, setStores] = useState<Store[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        //console.log("🟢 Employee Context:", employee); // Debugging

        if (!employee || !employee.employeeNtid) {
            console.warn("❌ Employee data not available yet. Retrying...");
            return;
        }

        const fetchStores = async () => {
            try {
                //console.log("🔄 Fetching authorized stores for:", employee.employeeNtid);
                const response = await getAuthorizedStoresAPI(employee.employeeNtid);
                const storesData = response?.stores || [];

                if (!Array.isArray(storesData)) {
                    throw new Error("Invalid store data format.");
                }

                setStores(storesData);
            } catch (err) {
                setError(err instanceof Error ? err.message : "⚠️ Failed to fetch authorized stores.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchStores();
    }, [employee]); // ✅ Re-run when `employee` updates

    return { stores, isLoading, error };
};
