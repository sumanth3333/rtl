import * as z from "zod";

// ✅ Define TypeScript Type for Company
export type Company = {
    companyName: string;
    email: string;
    companyAddress: {
        streetName: string;
        city: string;
        state: string;
        zipcode: string;
    };
    updatedPerson: string;
};

// ✅ Define Zod Schema for Validation
export const companySchema = z.object({
    companyName: z.string().min(3, "Company name must be at least 3 characters long"),
    email: z.string().email("Invalid email format"),
    companyAddress: z.object({
        streetName: z.string().min(5, "Street name must be at least 5 characters"),
        city: z.string().min(2, "City name must be at least 2 characters"),
        state: z.string().min(2, "State name must be at least 2 characters"),
        zipcode: z.string().min(5, "Zipcode must be at least 5 characters"),
    }),
    updatedPerson: z.string().min(3, "Updated person name is required"),
});
