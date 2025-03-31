import { CashCollectionData } from "@/types/cashCollectionTypes";
import apiClient from "../api/apiClient";

export const fetchCashCollectionAPI = async (
    companyName: string,
    startDate: string,
    endDate: string,
    dealerStoreId: string,
): Promise<CashCollectionData[]> => {
    try {
        //console.log("fetching cash collection")
        //console.log(`Fetching cash collection from: ${apiClient.defaults.baseURL}/company/cashCollection?companyName=${companyName}&startDate=${startDate}&endDate=${endDate}&dealerStoreId=${dealerStoreId}`);

        const response = await apiClient.get(`/company/cashCollection`, {
            params: { companyName, dealerStoreId, startDate, endDate },
        });

        //console.log("API Response:", response);

        if (!response || !response.data) {
            console.error("Invalid API Response:", response);
            return [];
        }

        if (typeof response.data === "string" && response.data.includes("<!DOCTYPE html>")) {
            console.error("Received an HTML response instead of JSON. Check backend API URL.");
            return [];
        }

        return response.data;
    } catch (error: any) {
        console.error("Error fetching cash collection data:", error.response?.data || error.message);
        return [];
    }
};
