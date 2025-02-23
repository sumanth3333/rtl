import { useState, useEffect } from "react";
import useUpgradePhonesService from "@/services/upgrades/upgradePhonesService";

export const useFetchSoldDevices = (selectedStore: string, startDate: string, endDate: string) => {
    const [soldDevices, setSoldDevices] = useState([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { fetchSoldDevicesAPI } = useUpgradePhonesService();

    useEffect(() => {
        const fetchSoldDevices = async () => {
            setIsLoading(true);
            setError(null);
            try {
                if (selectedStore && startDate && endDate) {
                    const data = await fetchSoldDevicesAPI(selectedStore, startDate, endDate);
                    setSoldDevices(data || []);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "Unknown error occurred.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSoldDevices();
    }, [selectedStore, startDate, endDate]);

    return { soldDevices, isLoading, error };
};
