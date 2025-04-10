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
    systemCard: z.number().nonnegative("System Card cannot be negative"),
    systemAccessories: z.number().nonnegative("System Accessories cannot be negative"),
    accessories: z.number().optional(), // ✅ Updated
    cashExpense: z.number().nonnegative("Cash Expense cannot be negative").optional(),
    expenseReason: z.string().optional(),
    boxesSold: z.number().nonnegative("Boxes Sold cannot be negative"),
    hsiSold: z.number().nonnegative("HSI Sold cannot be negative"),
    tabletsSold: z.number().nonnegative("Tablets Sold cannot be negative"),
    watchesSold: z.number().nonnegative("Watches Sold cannot be negative"),
    lastTransactionTime: z.string().regex(
        /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/,
        "Invalid time format. Please enter time in HH:mm:ss format."
    ),
    saleDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid sale date. Format must be YYYY-MM-DD."),
});


export type EodReportByOwner = z.infer<typeof eodReportSchema>;
