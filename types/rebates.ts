export interface RebateStoreInfo {
    dealerStoreId: string;
    storeName: string;
}

export interface RebateLineItem {
    imei: string;
    deviceName: string;
    purchasingCost: number;
    cashCollectedInStore: number;
    rebatePending: number;
    rebateReceived: number;
    rebateDifference: number;
    soldDate: string;
}

export interface RebateSummary {
    totalBoxes: number;
    boxesSoldFromInventory: number;
    totalPurchasingCost: number;
    totalPendingRebates: number;
    totalRebatesReceived: number;
    totalCashCollectedInStoreWhileSellingFromInventory: number;
    totalRebateDifference: number;
    rebatesSummary: RebateLineItem[];
}

export interface StoreRebateReport {
    store: RebateStoreInfo;
    detailedReportSummary: RebateSummary;
}

export interface WeeklyRebateDaySummary {
    postDate: string;
    batchStartDate: string;
    batchEndDate: string;
    totalCost: number;
    dealerDeduction: number;
    expectedRebates: number;
}

export interface WeeklyRebateStoreSummary {
    store: RebateStoreInfo;
    weekStartDate: string;
    weekEndDate: string;
    tuesdaySummary: WeeklyRebateDaySummary;
    fridaySummary: WeeklyRebateDaySummary;
}
