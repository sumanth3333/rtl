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
    expenseReason: string;
    saleDate: string;
}

export interface CashCollectionData {
    store: Store;
    cash: CashData;
    saleHistory: SaleHistory[];
    overalllCompanyCash: CashData;
}
