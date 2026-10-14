
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

export interface ClockInLocation {
    latitude: number | null;
    longitude: number | null;
    accuracyMeters: number | null;
}

export interface ClockInLocationErrorData {
    message: string;
    distanceMeters: number | null;
    displayDistance: string | null;
    accuracyMeters: number | null;
}

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