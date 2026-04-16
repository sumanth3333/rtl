import apiClient from "../api/apiClient";
import { API_ROUTES } from "@/constants/apiRoutes";
import { StoreRebateReport, WeeklyRebateStoreSummary } from "@/types/rebates";

export const fetchRebates = async (companyName: string, start: string, end: string): Promise<StoreRebateReport[]> => {
    const response = await apiClient.get(API_ROUTES.VIEW_REBATES, {
        params: {
            companyName,
            start,
            end,
        },
    });
    return response.data ?? [];
};

export const fetchWeeklyRebatesSummary = async (companyName: string): Promise<WeeklyRebateStoreSummary[]> => {
    const response = await apiClient.get(API_ROUTES.WEEKLY_REBATES_SUMMARY, {
        params: { companyName },
    });
    return response.data ?? [];
};
