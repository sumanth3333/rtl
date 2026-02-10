export type GoalsTrendingCurrentlyItem = {
    store: {
        dealerStoreId: string;
        storeName: string;
    };
    totalBoxes: number;
    acheivedTillDate: number;
    currentDifference: number;
    maximumPerformanceBonusGoal: number;
    currentDifferenceForMaximumPerformanceGoal: number;
    totalGoalAcheivedPercentage: number;
    totalMaximumPerformanceBonusAcheivedPercentage: number;
};
