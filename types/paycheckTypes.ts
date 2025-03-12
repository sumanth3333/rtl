export interface Employee {
    employeeNtid: string;
    employeeName: string;
}

export interface WorkDetails {
    numberOfHoursWorked: number;
    numberOfDaysWorked: number;
    workingHoursPay: number;
    totalAccessories: number;
    boxesSold: number;
    tabletsSold: number;
    hsiSold: number;
    watchesSold: number;
}

export interface CommissionDetails {
    boxesCommission: number;
    accessoriesCommission: number;
}

export interface DeductionDetails {
    taxes: number;
    totalDeductions: number;
}

export interface NetPayDetails {
    deduction: DeductionDetails;
    netPay: number;
}

export interface Store {
    dealerStoreId: string;
    storeName: string;
}

export interface Sale {
    boxesSold: number;
    accessories: number;
    tabletsSold: number;
    hsiSold: number;
    watchesSold: number;
    saleDate: string;
    store: Store;
}

export interface EmployeePaycheck {
    employee: Employee;
    work: WorkDetails;
    commission: CommissionDetails;
    netPay: NetPayDetails;
    sales: Sale[];
}
