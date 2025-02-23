
export interface CurrentEmployee {
    employeeNtid: string;
    employeeName: string;
}

export interface CurrentStore {
    dealerStoreId: string;
    storeName: string;
}
export type ClockInPayload = {
    employeeNtid: string;
    employeeName: string;
};

export interface EmployeeContextType {
    isClockin: boolean;
    clockinLocation: string | null;
    clockinTime: string | null;
    employee: CurrentEmployee | null;
    store: CurrentStore | null;
    setClockIn: (status: boolean, location?: string, time?: string) => void;
    setEmployeeData: (data: any) => void;
    clearEmployeeData: () => void;
}

export interface EmployeeResponse {
    employee: CurrentEmployee;
    store: CurrentStore;
    isClockin: string;
    isSaleSubmit: string;
}