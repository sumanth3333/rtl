export type PbCommission = {
    minimumPerformanceBonusWithoutRetention: number;
    maximumPerformanceBonusWithoutRetention: number;
    minimumPerformanceBonusWithRetention: number;
    maximumPerformanceBonusWithRetention: number;
};

export type ExpectedPBStore = {
    store: { dealerStoreId: string; storeName: string };
    totalBoxesSold: number;
    totalBoxesGoalMinimumPerformanceBonus: number;
    totalBoxesGoalMaximumPerformanceBonus: number;
    percentageAcheived: number;
    acheivedPerformanceBonusWithoutRetention: number;
    acheivedPerformanceBonusWithRetention: number;
    eligibility: {
        isQualified: "Qualified" | "Disqualified" | string;
        isMinimumNetActivationAcheived: string;
        isMinimumPercentageAcheived: string;
    };
};

export type ExpectedPBResponse = {
    pbCommission: PbCommission;
    expectedPerformanceBonus: ExpectedPBStore[];
};

export type ViewCommissionResponse = PbCommission;

export type SetPbCommissionRequest = PbCommission & { companyName: string };