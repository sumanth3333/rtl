export interface Phone {
    productName: string;
    imei: string;
    phoneNumber: string;
}

export interface InvoiceData {
    employeeNtid: string;
    dealerStoreId: string;
    accountNumber: number;
    activatedDate: string;
    amount: number;
    products: { productName: string; imei: string; phoneNumber: string }[];
}
