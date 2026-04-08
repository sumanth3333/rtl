import apiClient from "./api/apiClient";
import { API_ROUTES } from "@/constants/apiRoutes";
import { SaveRetentionPayload, StoreRetention } from "@/types/retention";

export const fetchCompanyRetentions = async (companyName: string): Promise<StoreRetention[]> => {
    const response = await apiClient.get(API_ROUTES.RETENTION_COMPANY, {
        params: { companyName },
    });
    return response.data ?? [];
};

export const fetchStoreRetentions = async (dealerStoreId: string): Promise<StoreRetention> => {
    const response = await apiClient.get(API_ROUTES.RETENTION_STORE, {
        params: { dealerStoreId },
    });
    return response.data;
};

export const saveRetentionUpdate = async (payload: SaveRetentionPayload) => {
    const response = await apiClient.post(API_ROUTES.RETENTION_SAVE, payload);
    return response.data;
};

export const fetchRetentionReport = async (companyName: string, start: string, end: string): Promise<StoreRetention[]> => {
    const response = await apiClient.get(API_ROUTES.RETENTION_REPORT, {
        params: { companyName, start, end },
    });
    return response.data ?? [];
};
