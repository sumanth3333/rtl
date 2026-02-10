export type Money = number;

export type EmployeePay = {
    employee: { employeeNtid: string; employeeName: string };
    numberOfHoursWorked: Money;
    boxesCommission: Money;
    accessoriesCommission: Money;
    earnedForMonth: Money;
};

export type ProfitLookupResponse = {
    revenue: {
        totalRevenue: Money;
        accessories: {
            totalCashAccessories: Money;
            totalCardAccessories: Money;
            totalSystemAccessories: Money;
            totalAccessories: Money;
        };
        compensation: { totalCompensation: Money };
    };
    expenses: {
        totalExpenses: Money;
        expenses: {
            paycheck?: { totalPaycheck: Money }; // still present ✅
            regularExpenses?: Record<string, Money>;
            storeExpenses?: { amount: Money };
            otherExpenses?: { amount: Money };
            dealerExpenses?: { amount: Money };
            legalExpenses?: { amount: Money };
            preActivationsTotal?: { totalInvoicesPrice: Money };
        };
    };
    profit: { profit: Money };
    profitByStores: Array<{
        store: { dealerStoreId: string; storeName: string };
        storeProfit: {
            storeRevenue: {
                totalRevenue: Money;
                accessories: Money;
                compensation: Money;
            };
            onHandProfit: Money;
            storeExpense: {
                totalExpense: Money;
                expenses: {
                    businessExpense: Money;
                    dealerDeduction: Money;
                    inStoreExpense: Money;
                    otherExpense: Money;
                    legalExpense: Money;
                    selfActivationInvoice: Money;
                    payCheck: Money;
                    employeesPay?: EmployeePay[]; // ✅ NEW
                };
            };
        };
    }>;
};
