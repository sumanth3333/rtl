import { z } from "zod";

// ✅ Define Store Schema with Nested Objects
export const storeSchema = z.object({
    dealerStoreId: z.string().min(3, "Store ID must be at least 3 characters."),
    storeName: z.string().min(3, "Store name must be at least 3 characters."),
    address: z.object({
        streetName: z.string().min(5, "Street name is required."),
        city: z.string().min(2, "City is required."),
        state: z.string().min(2, "State is required."),
        zipcode: z.string().length(5, "Zipcode must be 5 digits."),
    }),
    storeManager: z.string().optional(),
    storeContactNumber: z.string().regex(/^\d{10,15}$/, "Invalid phone number."),
    company: z.object({
        companyName: z.string(),
    }),
});

// ✅ Store Type from Schema
export type Store = z.infer<typeof storeSchema>;
