export type MagentaSaveOrderPayload = {
    dealerStoreId: string;
    numberOfLines: number;
    employeeNtid: string;
    phoneNumber: string;
    accountPin: string;
    accountNumber: string;
    transferPin: string;
    orderId: string;
    newAccountNumber: string;
    newAccountPin: string;
    instructions: string;
};

export type MagentaOrderCompletedPayload = {
    employeeNtid: string;
    accountNumber: string;
};

export type MagentaOrderCancellationPayload = {
    employeeNtid: string;
    accountNumber: string;
    reason: string;
};

export type MagentaOrder = {
    numberOfLines: number;
    phoneNumber: string;
    accountPin: string;
    accountNumber: string;
    transferPin: string;
    transferPinValidity: string;
    orderDate: string;
    orderId: string;
    newAccountNumber: string;
    newAccountPin?: string;
    instructions?: string;
    cancelled: boolean;
    completed?: boolean;
};

export type MagentaCancellation = {
    numberOfLines: number;
    phoneNumber: string;
    cancelledEmployeeName: string;
    cancelledDate: string;
    cancelledReason: string;
    cancelled: boolean;
};

export type MagentaSuccessOrder = {
    numberOfLines: number;
    phoneNumber: string;
    completedDate: string;
    completedEmployeeName: string;
    cancelled: boolean;
};

export type MagentaInStoreCounts = {
    totalOrdersCount: number;
    cancelledCount: number;
    sucessOrdersCount: number;
};

export type MagentaInStoreViewResponse = {
    counts: MagentaInStoreCounts;
    orders: MagentaOrder[];
    cancellations: MagentaCancellation[];
    successOrders: MagentaSuccessOrder[];
};

export type MagentaStoreSummary = {
    store: {
        dealerStoreId: string;
        storeName: string;
    };
    magentaDetails: MagentaInStoreViewResponse;
};
