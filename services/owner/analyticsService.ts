import apiClient from "@/services/api/apiClient";

export type StoreRef = {
    dealerStoreId: string;
    storeName: string;
};

export type DeviceSalesByStore = {
    store: StoreRef;
    devices: { device: string; quantity: number; }[];
};

export type PlanSalesByStore = {
    store: StoreRef;
    ratePlans: { planCode: string; quantity: number; }[];
};

export type TransactionTypeByStore = {
    store: StoreRef;
    transactionType: { type: string; quantity: number; }[];
};

export type SimUsedByStore = {
    store: StoreRef;
    type: { type: string; quantity: number; };
};

type DateRangeParams = {
    startDate: string;
    endDate: string;
    companyName: string;
};

const fetcher = async <T>(url: string, params: DateRangeParams): Promise<T> => {
    try {
        const response = await apiClient.get(url, { params });
        return response.data as T;
    } catch (error) {
        console.error(`Error fetching analytics from ${url}`, error);
        throw error;
    }
};

export const getMostSoldPhones = (params: DateRangeParams) =>
    fetcher<DeviceSalesByStore[]>("/company/viewMostSoldPhones", params);

export const getMostSoldPlans = (params: DateRangeParams) =>
    fetcher<PlanSalesByStore[]>("/company/viewMostSoldPlans", params);

export const getTransactionTypeMix = (params: DateRangeParams) =>
    fetcher<TransactionTypeByStore[]>("/company/viewTransactionType", params);

export const getSimCardsUsed = (params: DateRangeParams) =>
    fetcher<SimUsedByStore[]>("/company/viewSimCardsUsed", params);

