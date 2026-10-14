export interface MetricStoreSummary {
    dealerStoreId: string;
    storeName: string;
}

export interface MetricEmployeeSummary {
    employeeNtid: string;
    employeeName: string;
}

export interface StoreDateRangeMetric {
    store: MetricStoreSummary;
    activations: number;
    upgrades: number;
    migration: number;
    accessories: number;
    bts: number;
    hsi: number;
    freelines: number;
    totalActivations: number;
    totalBoxes: number;
}

export interface EmployeeDateRangeMetric {
    employee: MetricEmployeeSummary;
    activations: number;
    upgrades: number;
    migration: number;
    accessories: number;
    bts: number;
    hsi: number;
    freelines: number;
    totalActivations: number;
    totalBoxes: number;
}

export interface DateRangeMetricsResponse {
    stores: StoreDateRangeMetric[];
    employees: EmployeeDateRangeMetric[];
}
