"use client";

import { useState, useEffect } from "react";
import useUpgradePhonesService from "@/services/upgrades/upgradePhonesService";
import { Store, Device } from "@/types/upgradePhoneTypes";
import { useEmployee } from "@/hooks/useEmployee";

export const useFetchAvailableDevices = () => {
    const { store } = useEmployee();
    const [devices, setDevices] = useState<Device[]>([]);
    const [stores, setStores] = useState<Store[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { fetchAvailableUpgrades } = useUpgradePhonesService();

    useEffect(() => {
        if (!store) {
            setError(null);
            return;
        }

        setIsLoading(true);
        setError(null);

        const loadDevices = async () => {
            try {
                const data = await fetchAvailableUpgrades();

                // ✅ Extract Stores
                const storesList: Store[] = data.map((entry: { store: Store }) => entry.store);

                // ✅ Flatten Products & Attach storeId to each product
                const devicesList: Device[] = data.flatMap((entry: { store: Store; products: Device[] }) =>
                    entry.products.map((product) => ({
                        ...product,
                        storeId: entry.store.dealerStoreId, // ✅ Attach Store ID manually
                    }))
                );

                setStores(storesList);
                setDevices(devicesList);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Unknown error occurred.");
            } finally {
                setIsLoading(false);
            }
        };

        loadDevices();
    }, [store]);

    return { devices, stores, isLoading, error };
};
