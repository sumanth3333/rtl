"use client";

import { useState } from "react";
import useUpgradePhonesService from "@/services/upgrades/upgradePhonesService";
import { SaleRequest } from "@/types/upgradePhoneTypes";

const useSaleDevice = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { saveSale } = useUpgradePhonesService();

    const saleDevice = async (saleRequest: SaleRequest) => {
        setIsLoading(true);
        setError(null);
        try {
            await saveSale(saleRequest);
        } catch (err) {
            console.error("❌ Error in saleDevice:", err);
            setError(err instanceof Error ? err.message : "Failed to sell the device.");
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { saleDevice, isLoading, error };
};

export default useSaleDevice;
