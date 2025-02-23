"use client";

import { useState } from "react";
import useUpgradePhonesService from "@/services/upgrades/upgradePhonesService";
import { TransferRequest } from "@/types/upgradePhoneTypes";

const useTransferDevice = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { transferDevice } = useUpgradePhonesService();

    const transferDeviceHandler = async (transferRequest: TransferRequest) => {
        setIsLoading(true);
        setError(null);
        try {
            await transferDevice(transferRequest);
        } catch (err) {
            console.error("❌ Error in transferDevice:", err);
            setError(err instanceof Error ? err.message : "Failed to transfer the device.");
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { transferDevice: transferDeviceHandler, isLoading, error };
};

export default useTransferDevice;
