export interface Employee {
    employeeNtid: string;
    employeeName: string;
}

export interface Store {
    dealerStoreId: string;
    storeName: string;
}

export interface Sale {
    boxesSold: number;
    accessories: number; // previously was integer, now float
    upgrade: number;
    tabletsSold: number;
    hsiSold: number;
    watchesSold: number;
    migrations: number;
    clockInTime: string;
    clockOutTime: string;
    numberOfHoursWorkedByEmployee: number; // was string, now number
    saleDate: string;
    store: Store;
}

export interface WorkDetails {
    workingHoursPay: number;
    numberOfHoursWorked: number;
    numberOfDaysWorked: number;
    totalAccessories: number;
    boxesSold: number;
    upgradesSold: number;
    tabletsSold: number;
    hsiSold: number;
    watchesSold: number;
    migration: number;
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

export interface Preact {
    numberOfPreActivationPhonesActivated: number;
    numberOfPreActivatedPhonesSold: number;
    activatedValue: number;
    soldValue: number;
    deductedAmountForPreActivationFromAccessories: number;
}

export interface EmployeePaycheck {
    employee: Employee;
    work: WorkDetails;
    commission: CommissionDetails;
    netPay: NetPayDetails;
    preActivations: Preact;
    sales: Sale[];
}

export interface PaycheckResponse {
    totalPayCheckForCompany: number;
    paychecks: EmployeePaycheck[];
}
