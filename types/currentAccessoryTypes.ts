export interface Store {
    dealerStoreId: string;
    storeName: string;
}


export interface InventoryItem {
    productName: string;
    caseQuantity: number;
    glassQuantity: number;
}

export interface StoreCurrentStock {
    store: Store;
    updatedDate: string;
    updatedTime: string;
    updatedPerson: string;
    accessory: InventoryItem[];
}

export interface OverallProductInventory {
    productName: string;
    caseQuantity: number;
    glassQuantity: number;
}
