import { z } from "zod";

// ✅ Define Store Schema with Nested Objects
export const employeeSchema = z.object({
    employeeNtid: z.string().min(3, "Employee NTID must be at least 3 characters.").toUpperCase(),
    employeeName: z.string().min(6, "Employee name must have firstname and lastname."),
    phoneNumber: z.string().regex(/^\d{10,15}$/, "Invalid phone number - no special characters like -,(,),space."),
    email: z.string().email("please enter a valid email"),
    address: z.object({
        streetName: z.string().min(5, "Street name is required."),
        city: z.string().min(2, "City is required."),
        state: z.string().min(2, "State is required."),
        zipcode: z.string().length(5, "Zipcode must be 5 digits."),
    }),
    employeePayRatePerHour: z.number().min(0, "Please enter pay rate per hour"),
    commissionPercentage: z.number().min(0, "Please enter accessories commission %"),
    perBoxCommission: z.number().min(0, "Please enter commission per box"),
    accessLevel: z.string().optional(),
    AssignedManager: z.string().optional(),
    company: z.object({
        companyName: z.string(),
    }),
});

// ✅ Store Type from Schema
export type Employee = z.infer<typeof employeeSchema>;

export const eodReportSchema = z.object({
    store: z.object({ dealerStoreId: z.string().min(1, "Store ID is required") }),
    employee: z.object({ employeeNtid: z.string().min(1, "Employee NTID is required") }),
    actualCash: z.number().nonnegative("Actual Cash cannot be negative"),
    systemCash: z.number().nonnegative("System Cash cannot be negative"),
    actualCard: z.number().nonnegative("Actual Card cannot be negative"),
    systemCard: z.number().nonnegative("System Card cannot be negative"),
    systemAccessories: z.number().nonnegative("System Accessories cannot be negative"),
    accessoriesByEmployee: z.number().nonnegative("accessoriesByEmployee is auto-populated"),
    cashExpense: z.number().nonnegative("Cash Expense cannot be negative").optional(),
    expenseReason: z.string().optional(),
    boxesSold: z.number().nonnegative("Boxes Sold cannot be negative"),
    migrations: z.number().nonnegative("Migrations cannot be negative"),
    hsiSold: z.number().nonnegative("HSI Sold cannot be negative"),
    upgrade: z.number().nonnegative("Upgrades Sold cannot be negative"),
    tabletsSold: z.number().nonnegative("Tablets Sold cannot be negative"),
    watchesSold: z.number().nonnegative("Watches Sold cannot be negative"),
    expenseType: z.string().optional(),
    paymentMethod: z.string().optional(),
    lastTransactionTime: z.string()
        .regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, "Invalid time format. Please enter time in HH:mm:ss format."),
});

export type EodReport = z.infer<typeof eodReportSchema>;

