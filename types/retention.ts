export type RetentionStatus = "ACTIVE" | "CANCELLED" | "RETAINED" | "NOT_ACCESSIBLE" | "PORTED_OUT" | "PENDING";

export interface RetentionPhone {
    phoneNumber: string;
    status: RetentionStatus;
}

export interface RetentionAccount {
    accountNumber: string;
    phoneNumbers: RetentionPhone[];
    amountPaid: number;
    daysOld: number;
}

export interface RetentionStoreInfo {
    dealerStoreId: string;
    storeName: string;
}

export interface StoreRetention {
    transactionDate: string;
    store: RetentionStoreInfo;
    retentions: RetentionAccount[];
}

export interface SaveRetentionPayload {
    dealerStoreId: string;
    employeeNtid: string;
    accountNumber: string;
    phones: RetentionPhone[];
    amountPaid: number;
    transactionDate: string;
}
