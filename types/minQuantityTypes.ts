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
