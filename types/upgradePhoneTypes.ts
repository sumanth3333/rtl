import { Phone } from "./invoiceTypes";

export interface InvoiceRequest {
    employeeNtid: string;
    accountNumber: string;
    activatedDate: string;
    amount: number;
    numberOfPhones: number;
    phones: Phone[];
}

export interface InvoiceData {
    accountNumber: string;
    activatedDate: string;
    amount: number;
    numberOfPhones: number;
    products: Phone[];
}

export interface SaleRequest {
    employeeNtid: string;
    dealerStoreId: string;
    soldTo: string;
    soldPrice: number;
    product: {
        productName: string;
        imei: string;
        phoneNumber: string;
    };
}

export interface TransferRequest {
    employeeNtid: string;
    imei: string;
    targetDealerStoreId: string;
}

export interface Store {
    dealerStoreId: string;
    storeName: string;
}

export interface Device {
    id: number;
    productName: string;
    imei: string;
    phoneNumber?: string;
    activationDate?: string;
    daysOld?: number;
    storeId: string;
}

export interface UpgradePhonesProductDTO {
    productName: string;
    imei: string;
    phoneNumber: string;
}

export interface UpgradePhonesInvoiceRequest {
    employeeNtid: string;
    dealerStoreId: string;
    accountNumber: number;
    activatedDate: string;
    amount: number;
    products: UpgradePhonesProductDTO[];
}
