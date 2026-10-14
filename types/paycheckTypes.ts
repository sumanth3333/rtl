export interface Employee {
    employeeNtid: string;
    employeeName: string;
}

export interface Store {
    dealerStoreId: string;
    storeName: string;
}

export interface Migration {
    accounts: number;
    lines: number;
}

export interface Sale {
    boxesSold: number;
    accessories: number; // previously was integer, now float
    upgrade: number;
    tabletsSold: number;
    hsiSold: number;
    watchesSold: number;
    migrations: Migration;
    clockInTime: string;
    clockOutTime: string;
    numberOfHoursWorkedByEmployee: number; // was string, now number
    saleDate: string;
    store: Store;
}

export interface NotEligibleForCommissionEntry {
    date: string;
    totalPreActivatedPhones: number;
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
    migration: Migration;
    totalPreActivatedPhones: number;
    notEligibleForCommission: NotEligibleForCommissionEntry[];
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

export interface CommissionThreshold {
    itemType: string;
    threshold: number;
    payAmount: number;
}

export interface CommissionReference {
    referenceId: string;
    startDate: string;
    endDate: string;
    structureType: string;
    customStructure: unknown | null;
    defaultThresholds: CommissionThreshold[];
}

export interface CommissionCategoryCalculation {
    category: string;
    salesCount: number;
    appliedThreshold: number;
    commissionRate: number;
    commissionAmount: number;
    calculation: string;
}

export interface MagentaCommissionCalculation {
    totalAccounts: number;
    totalLines: number;
    calculationType: string;
    appliedThreshold: number;
    commissionRate: number;
    commissionAmount: number;
    calculation: string;
}

export interface CommissionCalculation {
    referenceId: string;
    startDate: string;
    endDate: string;
    structureType: string;
    categories: CommissionCategoryCalculation[];
    magenta: MagentaCommissionCalculation;
    salesCommission: number;
    magentaCommission: number;
    periodCommission: number;
}

export interface Adjustment {
    amount: number;
    reason: string;
}

export interface EmployeePaycheck {
    employee: Employee;
    work: WorkDetails;
    commission: CommissionDetails;
    netPay: NetPayDetails;
    sales: Sale[];
    commissionCalculations: CommissionCalculation[];
}

export interface PaycheckResponse {
    totalHourlyPay: number;
    totalSalesCommission: number;
    totalMagentaCommission: number;
    totalAccessoriesCommission: number;
    totalCommission: number;
    totalGrossPay: number;
    totalTaxes: number;
    totalPayCheckForCompany: number;
    commissionReference: CommissionReference[];
    paychecks: EmployeePaycheck[];
}



export interface PaySlipDetail {
    fromDate: string;      // "2025-10-01"
    toDate: string;        // "2025-10-31"
    paidAmount: number;    // 2290.83
    paidDate: string;      // "2025-11-08"
    paySlip: string;       // base64 PDF
};

export interface EmployeeInfo {
    employeeNtid: string;
    employeeName: string;
};

export interface GeneratedEmployeePaychecks {
    employee: EmployeeInfo;
    paymentDetails: PaySlipDetail[];
};
