export type TodayGoal = {
    activation: number;
    accessories: number;
    tablet: number;
    hsi: number;
    upgrade: number;
    migration: number;
};

export type TodayGoalRow = {
    store: {
        dealerStoreId: string;
        storeName: string;
    };
    todayGoal: TodayGoal;
};