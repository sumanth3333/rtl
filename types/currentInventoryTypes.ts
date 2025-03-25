export interface Store {
    dealerStoreId: string;
    storeName: string;
}

export interface InventoryItem {
    productName: string;
    currentQuantity: number;
}

export interface StoreCurrentStock {
    store: Store;
    updatedDate: string;
    updatedTime: string;
    updatedPerson: string;
    currentStockValue: number;
    inventory: InventoryItem[];
}

export interface OverallProductInventory {
    productName: string;
    currentQuantity: number;
}
