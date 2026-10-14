import apiClient from "../api/apiClient";
import { API_ROUTES } from "@/constants/apiRoutes";
import {
    AssignStrategyRequest,
    SalesSprintStrategy,
    StoreStrategyAssignmentsResponse,
    StrategyOption,
} from "@/types/salesSprintStrategyTypes";

export async function fetchAvailableStrategies(): Promise<SalesSprintStrategy[]> {
    const response = await apiClient.get(API_ROUTES.SALES_SPRINT_STRATEGY.AVAILABLE);
    return Array.isArray(response.data) ? response.data : [];
}

export async function fetchStrategyOptions(): Promise<StrategyOption[]> {
    const response = await apiClient.get(API_ROUTES.SALES_SPRINT_STRATEGY.STRATEGIES);
    return Array.isArray(response.data) ? response.data : [];
}

export async function fetchStoreStrategyAssignments(
    companyName: string,
    yearMonth: string
): Promise<StoreStrategyAssignmentsResponse> {
    const response = await apiClient.get(
        `${API_ROUTES.SALES_SPRINT_STRATEGY.STORES_BASE}/${encodeURIComponent(companyName)}/${yearMonth}`
    );
    return response.data;
}

export async function assignStrategy(payload: AssignStrategyRequest): Promise<StoreStrategyAssignmentsResponse> {
    const response = await apiClient.post(API_ROUTES.SALES_SPRINT_STRATEGY.ASSIGN, payload);
    return response.data;
}
