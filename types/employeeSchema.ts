import { z } from "zod";

// ✅ Define Store Schema with Nested Objects
export const employeeSchema = z.object({
    employeeNtid: z.string().min(3, "Employee NTID must be at least 3 characters.").toUpperCase(),
    employeeName: z.string().min(6, "Employee name must have firstname and lastname."),
    phoneNumber: z.coerce.string().trim().regex(/^\d{10,15}$/, "Invalid phone number - digits only, 10-15 length."),
    email: z.string().email("please enter a valid email"),
    isHavingAssurantAccess: z.boolean().optional(),
    address: z.object({
        streetName: z.string().min(5, "Street name is required."),
        city: z.string().min(2, "City is required."),
        state: z.string().min(2, "State is required."),
        zipcode: z.string().length(5, "Zipcode must be 5 digits."),
    }),
    employeePayRatePerHour: z.number().min(0, "Please enter pay rate per hour"),
    commissionPercentage: z.number().min(0, "Please enter accessories commission %"),
    perBoxCommission: z.number().min(0, "Please enter commission per box"),
    maxHours: z.number().min(0, "Please enter maximum hours").optional(),
    accessLevel: z.string().optional(),
    AssignedManager: z.string().optional(),
    company: z.object({
        companyName: z.string(),
    }),
});

// ✅ Store Type from Schema
export type Employee = z.infer<typeof employeeSchema>;

// ✅ Shape returned by GET /employee/inactiveEmployees - distinct from the add/edit Employee form schema
export interface InactiveEmployee {
    employeeId: number;
    employeeNtid: string;
    employeeName: string;
    phoneNumber: number;
    email: string;
    employeePayRatePerHour: number;
    commissionPercentage: number;
    perBoxCommission: number;
    active: boolean;
    havingAssurantAccess: boolean;
}

export const eodReportSchema = z.object({
    store: z.object({ dealerStoreId: z.string().min(1, "Store ID is required") }),
    employee: z.object({ employeeNtid: z.string().min(1, "Employee NTID is required") }),
    actualCash: z.number().nonnegative("Actual Cash cannot be negative"),
    systemCash: z.number().nonnegative("System Cash cannot be negative"),
    actualCard: z.number().nonnegative("Actual Card cannot be negative"),
    creditCard: z.number().nonnegative("Credit Card total cannot be negative"),
    debitCard: z.number().nonnegative("Debit Card total cannot be negative"),
    systemCard: z.number().nonnegative("System Card cannot be negative"),
    systemAccessories: z.number().nonnegative("System Accessories cannot be negative"),
    accessoriesByEmployee: z.number().nonnegative("accessoriesByEmployee is auto-populated"),
    boxesSold: z.number().nonnegative("Boxes Sold cannot be negative"),
    migrations: z.number().nonnegative("Migrations cannot be negative"),
    hsiSold: z.number().nonnegative("HSI Sold cannot be negative"),
    upgrade: z.number().nonnegative("Upgrades Sold cannot be negative"),
    tabletsSold: z.number().nonnegative("Tablets/Watches Sold cannot be negative"),
    watchesSold: z.number().nonnegative("2GPROMO Sold cannot be negative"),
    expenses: z.array(
        z.object({
            id: z.number().nonnegative().default(0),
            amount: z.number().nonnegative(),
            reason: z.string().min(1),
            expenseType: z.enum(["Short", "Over"]),
            paymentType: z.enum(["Cash", "Card"]),
        })
    ).optional(),
    lastTransactionTime: z.string()
        .regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, "Invalid time format. Please enter time in HH:mm:ss format."),
});

export type EodReport = z.infer<typeof eodReportSchema>;

// ✅ One employee's sale credit inside a saveSaleDetails submission.
// salesCreditOnly=true means this employee gets the credit without having physically worked at this store.
export interface EmployeeSaleEntry {
    employeeNtid: string;
    salesCreditOnly: boolean;
    boxesSold: number;
    systemAccessories: number;
    accessoriesByEmployee: number;
    upgrade: number;
    tabletsSold: number;
    hsiSold: number;
    watchesSold: number;
    migrations: number;
}

export interface EodExpenseEntry {
    id: number;
    amount: number;
    reason: string;
    expenseType: "Short" | "Over";
    paymentType: "Cash" | "Card";
}

// ✅ Body for POST /sale/saveSaleDetails - one request covering every employee credited for this store/date
export interface EodSubmissionRequest {
    dealerStoreId: string;
    systemCash: number;
    systemCard: number;
    actualCash: number;
    actualCard: number;
    creditCard: number;
    debitCard: number;
    lastTransactionTime: string;
    employeeSales: EmployeeSaleEntry[];
    expenses: EodExpenseEntry[];
}
