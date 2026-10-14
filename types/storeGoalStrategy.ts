export type DailyMetricStatus = "ACHIEVED" | "PARTIAL" | "MISSED" | "GREAT_WORK" | "NO TARGET" | string;

export interface DailyMetricResult {
    target: number;
    actual: number;
    percentage: number;
    status: DailyMetricStatus;
}

export interface PhaseDayResult {
    date: string;
    activations: DailyMetricResult;
    bts: DailyMetricResult;
    hsi: DailyMetricResult;
    migrations: DailyMetricResult;
    accessories: DailyMetricResult;
}

export interface PhaseMetricPerformance {
    target: number;
    actual: number;
    achievementPercentage: number;
    remaining: number;
    carryForward: number;
}

export interface PhaseSprintPerformance {
    activations: PhaseMetricPerformance;
    accessories: PhaseMetricPerformance;
    bts: PhaseMetricPerformance;
    hsi: PhaseMetricPerformance;
    migrations: PhaseMetricPerformance;
}

export interface PhaseHistoryEntry {
    sprintNumber: number;
    sprintStartDate: string;
    sprintEndDate: string;
    days: PhaseDayResult[];
    sprintPerformance?: PhaseSprintPerformance;
}

export interface PhaseTarget {
    activations: number;
    accessories: number;
    upgrades: number;
    hsi: number;
    bts: number;
    freeLines: number;
    migrations: number;
}

export interface StoreTodayGoal {
    date: string;
    activations: number;
    bts: number;
    hsi: number;
    migrations: number;
    accessories: number;
}

export interface FocusSuggestion {
    focusItem: string;
    achievementPercentage: number;
    message: string;
}

export interface StoreGoalStrategy {
    dealerStoreId: string;
    storeName: string;
    yearMonth: string;
    monthStatus: string;
    strategyName: string;
    sprintNumber: number;
    sprintPercentage: number;
    sprintStartDate: string;
    sprintEndDate: string;
    sprintTarget: PhaseTarget;
    previousSprints: PhaseHistoryEntry[];
    todayGoal: StoreTodayGoal;
    carryForwardGoal: PhaseTarget;
    focusSuggestions: FocusSuggestion[];
}
