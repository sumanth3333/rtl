export type CustomerReturnItem = {
    employeeNtid: string;
    imei: string;
    deviceName: string;
    phoneNumber: string;
    accountPin: string;
    activatedDate: string;
    returnedDate?: string;
    refundedAmount?: number | null;
    refundPaymentType?: "cash" | "card" | null;
};

export type CustomerReturnPayload = {
    dealerStoreId: string;
    employeeNtid: string;
    imei: string;
    deviceName: string;
    phoneNumber: string;
    accountPin: string;
    activatedDate: string;
    amountRefunded?: number | null;
    refundPaymentType?: "cash" | "card" | null;
};
