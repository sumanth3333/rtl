export interface NewProduct {
    productName: string;
    price: number;
    productCategory: string;
    brand: string;
}

// API returns id -> label maps, e.g. { "1": "Phone", "2": "HSI" }
export type IdLabelMap = Record<string, string>;

export interface ProductStockByStore {
    dealerStoreId: string;
    storeName: string;
    quantityAvailable: number;
}

export interface AdminProductSummary {
    id: number;
    name: string;
    category: string;
    brand: string | null;
    price: number;
    active: boolean;
}

export interface ProductStockAvailabilityResponse {
    productId: number;
    productName: string;
    active: boolean;
    totalStoresWithStock: number;
    totalQuantityAvailable: number;
    stores: ProductStockByStore[];
}
