export interface Store {
    dealerStoreId: string;
    storeName: string;
}

export interface InventoryItem {
    dealerStoreId: string;
    storeName: string;
    productName: string;
    minimumQuantity: number;
    currentQuantity: number;
}

export interface StoreCurrentStock {
    store: Store;
    currentStockValue: number;
    inventory: InventoryItem[];
}
