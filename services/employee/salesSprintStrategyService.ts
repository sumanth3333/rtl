import apiClient from "../api/apiClient";
import { API_ROUTES } from "@/constants/apiRoutes";
import { StoreGoalStrategy } from "@/types/storeGoalStrategy";

export async function fetchStoreGoalStrategy(dealerStoreId: string): Promise<StoreGoalStrategy> {
    const response = await apiClient.get(`${API_ROUTES.SALES_SPRINT_STRATEGY.STORE_GOAL}/${dealerStoreId}`);
    return response.data;
}
