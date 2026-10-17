export interface ManualClockInPayload {
    dealerStoreId: string;
    employeeNtid: string;
    clockInDate: string; // YYYY-MM-DD
    clockInTime: string; // HH:mm
}

export interface ManualClockInResponse {
    message: string;
    employeeNtid: string;
    employeeName: string;
    dealerStoreId: string;
    storeName: string;
    clockInDate: string;
    clockInTime: string;
    timezone: string;
    status: string;
}
