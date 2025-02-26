import { z } from "zod";

export const createInvoiceSchema = z.object({
    employeeNtid: z.string().nonempty("Employee ID is required"),
    dealerStoreId: z.string().nonempty("Dealer Store ID is required"),

    // ✅ Keep as a string in the form but convert it to a number
    accountNumber: z.preprocess(
        (val) => (typeof val === "string" ? val.trim() : val),
        z.string()
            .length(9, "Account number must be exactly 9 digits")
            .regex(/^\d+$/, "Account number must contain only numbers")
    ),

    activatedDate: z.string().nonempty("Activation Date is required"),

    // ✅ Keep amount as string but convert it to number
    amount: z.preprocess(
        (val) => (typeof val === "string" ? parseFloat(val.replace(/[^0-9.]/g, "")) : val),
        z.number()
            .min(0.01, "Amount must be greater than 0")
            .max(99999.99, "Amount cannot exceed 99,999.99")
    ),

    numberOfPhones: z.coerce.number().min(0, "At least one phone must be selected").max(5, "Maximum 5 phones allowed"),

    products: z.array(
        z.object({
            productName: z.string().nonempty("Product Name is required"),
            imei: z.string()
                .length(15, "IMEI must be exactly 15 digits")
                .regex(/^\d+$/, "IMEI must contain only numbers"),
            phoneNumber: z.string()
                .length(10, "Phone number must be exactly 10 digits")
                .regex(/^\d+$/, "Phone number must contain only numbers"),
        })
    ).nonempty("At least one phone must be added"),
});

export type CreateInvoiceFormValues = z.infer<typeof createInvoiceSchema>;
