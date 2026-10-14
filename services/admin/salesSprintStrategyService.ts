import apiClient from "../api/apiClient";
import { API_ROUTES } from "@/constants/apiRoutes";
import { SalesSprintStrategy, UpdateSalesSprintStrategyPayload } from "@/types/salesSprintStrategyTypes";

export async function fetchAvailableStrategies(): Promise<SalesSprintStrategy[]> {
    const response = await apiClient.get(API_ROUTES.SALES_SPRINT_STRATEGY.AVAILABLE);
    return Array.isArray(response.data) ? response.data : [];
}

export async function saveNewStrategy(payload: SalesSprintStrategy): Promise<SalesSprintStrategy> {
    const response = await apiClient.post(API_ROUTES.SALES_SPRINT_STRATEGY.SAVE, payload);
    return response.data;
}

export async function updateStrategy(id: number, payload: UpdateSalesSprintStrategyPayload): Promise<SalesSprintStrategy> {
    const response = await apiClient.put(`${API_ROUTES.SALES_SPRINT_STRATEGY.BASE}/${id}`, payload);
    return response.data;
}
