export type CustomerReturnItem = {
    employeeNtid: string;
    imei: string;
    deviceName: string;
    phoneNumber: string;
    accountPin: string;
    activatedDate: string;
    returnedDate?: string;
};

export type CustomerReturnPayload = {
    dealerStoreId: string;
    employeeNtid: string;
    imei: string;
    deviceName: string;
    phoneNumber: string;
    accountPin: string;
    activatedDate: string;
};
