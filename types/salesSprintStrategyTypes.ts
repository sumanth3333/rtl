export interface SalesSprintStrategy {
    id?: number;
    strategyName: string;
    sprintOnePercentage: number;
    sprintTwoPercentage: number;
    sprintThreePercentage: number;
    sprintFourPercentage: number;
    active: boolean;
}

export type UpdateSalesSprintStrategyPayload = Omit<SalesSprintStrategy, "id" | "strategyName">;

export interface StrategyOption {
    id: number;
    strategyName: string;
}

export interface StoreStrategyAssignment {
    dealerStoreId: string;
    storeName: string;
    strategyName: string; // "N/A" when unassigned
}

export interface StoreStrategyAssignmentsResponse {
    yearMonth: string;
    stores: StoreStrategyAssignment[];
}

export interface AssignStrategyRequest {
    dealerStoreId: string;
    salesSprintStrategyId: number;
    yearMonth: string;
}
