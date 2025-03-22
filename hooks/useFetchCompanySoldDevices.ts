// hooks/useFetchCompanySoldDevices.ts
import { fetchCompanySoldDevicesAPI } from "@/services/upgrades/upgradePhonesService";
import { useEffect, useState } from "react";

export const useFetchCompanySoldDevices = (companyName: string, startDate: string, endDate: string) => {
    const [data, setData] = useState([]);
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!companyName || !startDate || !endDate) return;

            setLoading(true);
            setError(null);

            try {
                const result = await fetchCompanySoldDevicesAPI(companyName, startDate, endDate);
                setData(result || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Unknown error");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [companyName, startDate, endDate]);

    return { data, isLoading, error };
};
