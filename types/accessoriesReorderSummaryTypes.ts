export interface Store {
    dealerStoreId: string;
    storeName: string;
}

export interface InventoryItem {
    productName: string;
    minimumCaseQuantity: number;
    currentCaseQuantity: number;
    minimumGlassQuantity: number;
    currentGlassQuantity: number;
}

export interface ReorderSummaryData {
    store: Store;
    inventory: InventoryItem[];
}

export interface StoreReorderSummary {
    store: Store;
    inventory: InventoryItem[];
}