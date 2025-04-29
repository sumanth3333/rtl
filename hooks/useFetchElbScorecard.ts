"use client";

import { useEffect, useState } from "react";
import apiClient from "@/services/api/apiClient";

interface StoreMTD {
    activationTargetToStore: number;
    accessoriesTargetToStore: number;
    hsiTargetToStore: number;
    tabletsTargetToStore: number;
    smartwatchTargetToStore: number;
    targetMonth: string;
}

interface EmployeeMTD {
    phonesTargetToEmployee: number;
    accessoriesTargetByEmployee: number;
    hsiTarget: number;
    tabletsTargetByEmployee: number;
    smartwatchTargetByEmployee: number;
    targetMonth: string;
}

interface StoreData {
    store: {
        dealerStoreId: string;
        storeName: string;
    };
    storeMTD: StoreMTD[];
}

interface EmployeeData {
    employee: {
        employeeNtid: string;
        employeeName: string;
    };
    employeeMTD: EmployeeMTD[];
}

type ElbScorecardData = (StoreData | EmployeeData)[];

export const useFetchElbScorecard = (companyName: string) => {
    const [data, setData] = useState<ElbScorecardData>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!companyName) return;

        const fetchElbData = async () => {
            try {
                const res = await apiClient.get(`/company/MTDMetricsForStoresAndEmployees`, {
                    params: { companyName },
                });
                //console.log(res);
                setData(res.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to fetch ELB Scorecard data.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchElbData();
    }, [companyName]);

    return { data, isLoading, error };
};
