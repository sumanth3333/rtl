export interface StoreMinQuantitySetup {
    store: {
        dealerStoreId: string;
        storeName: string;
    };
    products: ProductMinQuantity[];
}

export interface ProductMinQuantity {
    id: number;
    productName: string;
    quantity: number;
}

export interface StoreAccessoriesMinQuantitySetup {
    store: {
        dealerStoreId: string;
        storeName: string;
    };
    products: AccessoriesMinQuantity[];
}

export interface AccessoriesMinQuantity {
    id: number;
    productName: string;
    caseQuantity: number;
    glassQuantity: number;
}
