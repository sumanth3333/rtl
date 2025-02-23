"use client";

import { cancelTransferAPI, receiveDeviceAPI } from "@/services/upgrades/transferService";


export const useReceiveActions = () => {
    const handleReceive = async (payload: { employeeNtid: string; receivingDealerStoreId: string; imei: string }) => {
        await receiveDeviceAPI(payload);
    };

    const handleCancel = async (deviceId: string) => {
        await cancelTransferAPI(deviceId);
    };

    return { handleReceive, handleCancel };
};
