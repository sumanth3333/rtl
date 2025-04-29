export interface Store {
    dealerStoreId: string;
    storeName: string;
}

export interface StoreTargetRequest {
    store: {
        dealerStoreId: string;
    };
    target: StoreTarget;
}

export interface StoreTarget {
    activationTargetToStore: number;
    upgradeTargetToStore: number;
    accessoriesTargetToStore: number;
    hsiTargetToStore: number;
    tabletsTargetToStore: number;
    smartwatchTragetToStore: number;
    targetMonth: string;
}

export interface StoreTargetResponse {
    target: StoreTarget | null; // ✅ Now supports API format
    store: Store;
}

// -------------------- Employee Types --------------------


export interface EmployeeTargetRequest {
    employee: {
        employeeNtid: string;
    };
    target: EmployeeTarget
}

export interface EmployeeDTO {
    employeeNtid: string;
    employeeName: string;
}

export interface EmployeeTarget {
    phonesTargetToEmployee: number;
    upgradeTargetToEmployee: number;
    accessoriesTargetByEmployee: number;
    hsiTarget: number;
    tabletsTargetByEmployee: number;
    smartwatchTargetByEmployee: number;
    targetMonth: string;
}

export interface EmployeeTargetResponse {
    target: EmployeeTarget | null; // ✅ Matches API response
    employeeDTO: EmployeeDTO;
}