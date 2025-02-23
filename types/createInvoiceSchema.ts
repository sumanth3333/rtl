import { z } from "zod";

export const createInvoiceSchema = z.object({
    employeeNtid: z.string().nonempty("Employee ID is required"),
    dealerStoreId: z.string().nonempty("Dealer Store ID is required"),

    // ✅ Ensure accountNumber is a valid number (Java expects Long)
    accountNumber: z.coerce.number().int().min(100000, "Account number should be at least 6 digits"),

    activatedDate: z.string().nonempty("Activation Date is required"),

    // ✅ Ensure amount is a valid number
    amount: z.coerce.number().min(1, "Amount must be greater than 0"),

    // ✅ Add `numberOfPhones`
    numberOfPhones: z.coerce.number().min(0).max(5, "Maximum 5 phones allowed"),

    // ✅ Ensure at least one product is added
    products: z.array(
        z.object({
            productName: z.string().nonempty("Product Name is required"),
            imei: z.string().length(15, "IMEI should be exactly 15 digits"),
            phoneNumber: z.string().length(10, "Phone number should be exactly 10 digits").regex(/^\d+$/, "Phone number must be numeric"),
        })
    ).nonempty("At least one phone must be added"),
});

export type CreateInvoiceFormValues = z.infer<typeof createInvoiceSchema>;
