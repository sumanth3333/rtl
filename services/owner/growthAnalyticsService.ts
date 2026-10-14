import apiClient from "../api/apiClient";
import { API_ROUTES } from "@/constants/apiRoutes";
import { StoreGoalStrategy } from "@/types/storeGoalStrategy";

export async function fetchGrowthAnalytics(companyName: string, month?: string): Promise<StoreGoalStrategy[]> {
    const response = await apiClient.get(
        `${API_ROUTES.SALES_SPRINT_STRATEGY.COMPANY_GOALS}/${encodeURIComponent(companyName)}`,
        { params: month ? { month } : undefined }
    );
    return Array.isArray(response.data) ? response.data : [];
}
