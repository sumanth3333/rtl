import { z } from "zod";

export interface OwnerContextType {
    companyName: string;
    ownerEmail: string;
    isOwner: boolean;
    setOwnerData: (company: string, email: string) => void;
    clearOwnerData: () => void;
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
    accessories: z.number().optional(), // ✅ Updated
    boxesSold: z.number().nonnegative("Activations cannot be negative"),
    upgrade: z.number().nonnegative("Upgrades cannot be negative"),
    migrations: z.number().nonnegative("Migrations cannot be negative"),
    hsiSold: z.number().nonnegative("HSI cannot be negative"),
    tabletsSold: z.number().nonnegative("Tablets cannot be negative"),
    watchesSold: z.number().nonnegative("Watches cannot be negative"),
    expenses: z.array(
        z.object({
            id: z.number().optional(), // present only when this expense already exists on the backend
            amount: z.number().nonnegative(),
            reason: z.string().min(1),
            expenseType: z.enum(["Short", "Over"]),
            paymentType: z.enum(["Cash", "Card"]),
            deleteExpense: z.boolean().optional(), // true = remove this existing expense on submit
        })
    ).optional(),
    clockinTime: z.string().regex(
        /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/,
        "Invalid time format. Please enter time in HH:mm or HH:mm:ss format."
    ),
    clockoutTime: z.string().regex(
        /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/,
        "Invalid time format. Please enter time in HH:mm or HH:mm:ss format."
    ),
    lastTransactionTime: z.string().regex(
        /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/,
        "Invalid time format. Please enter time in HH:mm or HH:mm:ss format."
    ),

    saleDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid sale date. Format must be YYYY-MM-DD."),

});


export type EodReportByOwner = z.infer<typeof eodReportSchema>;

// ✅ Wire shape for POST /company/submitSaleOnBehalfOfEmployee - a store-level envelope around
// a per-employee sales array. This form only ever submits for the one employee selected in the
// page's dropdown, so employeeSales always has exactly one entry, and salesCreditOnly is always
// false (this flow never credits a sale to someone who didn't work the shift).
export interface SubmitSaleOnBehalfOfEmployeeExpense {
    id: number;
    reason: string;
    amount: number;
    paymentType: "Cash" | "Card";
    expenseType: "Short" | "Over";
    deleteExpense: boolean;
}

export interface SubmitSaleOnBehalfOfEmployeeEntry {
    employeeNtid: string;
    clockinTime: string;
    clockoutTime: string;
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

export interface SubmitSaleOnBehalfOfEmployeeRequest {
    dealerStoreId: string;
    saleDate: string;
    systemCash: number;
    systemCard: number;
    creditCard: number;
    debitCard: number;
    actualCash: number;
    actualCard: number;
    lastTransactionTime: string;
    expenses: SubmitSaleOnBehalfOfEmployeeExpense[];
    employeeSales: SubmitSaleOnBehalfOfEmployeeEntry[];
}
