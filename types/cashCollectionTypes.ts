export interface Store {
    dealerStoreId: string;
    storeName: string;
}

export interface CashData {
    systemCash: number;
    actualCash: number;
    systemCard: number;
    actualCard: number;
    systemAccessories: number;
    cashAccessories: number;
    cardAccessories: number;
    totalAccessories?: number; // optional if sometimes omitted from API
}

export interface Expense {
    reason: string;
    amount: number;
    paymentType: string | null; // e.g., 'Cash', 'Card', or null
    expenseType: string;        // e.g., 'Short', 'Over'
}

export interface SaleHistory {
    saleId: number;
    employeeName: string;
    boxesSold: number;
    systemAccessories: number;
    accessories: number;
    tabletsSold: number;
    hsiSold: number;
    watchesSold: number;
    systemCash: number;
    systemCard: number;
    actualCash: number;
    actualCard: number;
    cashExpense: number;
    expenseReason: string; // this is now a legacy field; use `expenses[]` instead
    saleDate: string;
    lastTransactionTime?: string;
    expenses: Expense[]; // NEW: multiple expense records per sale
}

export interface CashCollectionData {
    store: Store;
    cash: CashData;
    saleHistory: SaleHistory[];
    overalllCompanyCash: CashData;
}
