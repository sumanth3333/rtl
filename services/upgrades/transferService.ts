import apiClient from "../api/apiClient";


export const fetchTransfersAPI = async (dealerStoreId: string) => {
    try {
        //console.log("Fetching pending transfers...");
        const response = await apiClient.get(`/upgradePhones/pendings/${dealerStoreId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching transfers:", error);
        throw error;
    }
};

export const receiveDeviceAPI = async (payload: { employeeNtid: string; receivingDealerStoreId: string; imei: string }) => {
    try {
        //console.log("Receiving device:", payload);
        const response = await apiClient.post(`/upgradePhones/receive`, payload);
        return response.data;
    } catch (error) {
        console.error("Error receiving device:", error);
        throw error;
    }
};

export const cancelTransferAPI = async (deviceId: string) => {
    try {
        const response = await apiClient.post(`/upgradePhones/cancelTransfer`, { deviceId });
        return response.data;
    } catch (error) {
        console.error("Error canceling transfer:", error);
        throw error;
    }
};
