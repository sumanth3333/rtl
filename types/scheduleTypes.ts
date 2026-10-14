export type DayOfWeek = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";

// ---- Generate: request ----

export interface StoreDayRequirement {
    dayOfWeek: DayOfWeek;
    requiredEmployees: number;
}

export interface StoreRequirement {
    dealerStoreId: string;
    days: StoreDayRequirement[];
}

export interface GenerateScheduleRequest {
    companyName: string;
    scheduleStartDate: string;
    scheduleEndDate: string;
    storeRequirements: StoreRequirement[];
}

// ---- Generate: response ----

export interface AssignmentReason {
    storeDaysWorkedLast30Days: number;
    storeHoursWorkedLast30Days: number;
    storeActivationsLast30Days: number;
    storeAccessoriesLast30Days: number;
    storeUpgradesLast30Days: number;
    storeTabletsLast30Days: number;
    storeHsiLast30Days: number;
    storeWatchesLast30Days: number;
    continuityScore: number;
    storeSalesScore: number;
    efficiencyScore: number;
    weeklyPerformanceScore: number;
    fairnessScore: number;
    finalScore: number;
    reason: string;
}

export interface ScheduledEmployee {
    employeeNtid: string;
    employeeName: string;
    startTime: string;
    endTime: string;
    assignedHours: number;
    // Manually added/swapped employees weren't scored by the generator, so these are absent for them.
    assignmentScore?: number;
    assignmentReason?: AssignmentReason;
}

export interface GeneratedScheduleDay {
    date: string;
    dayOfWeek: DayOfWeek;
    storeOpenTime: string;
    storeCloseTime: string;
    storeHours: number;
    requiredEmployees: number;
    assignedEmployees: number;
    fullyStaffed: boolean;
    employees: ScheduledEmployee[];
}

export interface GeneratedScheduleStore {
    dealerStoreId: string;
    storeName: string;
    days: GeneratedScheduleDay[];
}

export interface GenerateScheduleResponse {
    companyName: string;
    scheduleStartDate: string;
    scheduleEndDate: string;
    performanceStartDate: string;
    performanceEndDate: string;
    continuityStartDate: string;
    continuityEndDate: string;
    totalStores: number;
    totalEmployees: number;
    totalAssignedEmployees: number;
    totalLeftOutEmployees: number;
    stores: GeneratedScheduleStore[];
}

// ---- Save: request ----

export interface SaveScheduleEmployee {
    employeeNtid: string;
    shiftStartTime: string;
    shiftEndTime: string;
}

export interface SaveScheduleDay {
    date: string;
    employees: SaveScheduleEmployee[];
}

export interface SaveScheduleStore {
    dealerStoreId: string;
    days: SaveScheduleDay[];
}

export interface SaveScheduleRequest {
    companyName: string;
    scheduleStartDate: string;
    scheduleEndDate: string;
    stores: SaveScheduleStore[];
}

// ---- Update: request (single store, single day) ----

export interface UpdateScheduleEmployee {
    employeeNtid: string;
    shiftStartTime: string;
    shiftEndTime: string;
    remove: boolean;
}

export interface UpdateScheduleRequest {
    companyName: string;
    dealerStoreId: string;
    date: string;
    employees: UpdateScheduleEmployee[];
}

export interface DayUpdateState {
    status: "saving" | "success" | "error";
    error?: string;
}
