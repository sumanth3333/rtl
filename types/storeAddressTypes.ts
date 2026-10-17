export interface StoreAddress {
    dealerStoreId: string;
    storeName: string;
    streetName: string;
    city: string;
    state: string;
    zipcode: number;
    latitude: number;
    longitude: number;
    timezone: string;
}

export interface UpdateStoreAddressPayload {
    dealerStoreId: string;
    streetName: string;
    city: string;
    state: string;
    zipcode: number;
    latitude: number;
    longitude: number;
}
