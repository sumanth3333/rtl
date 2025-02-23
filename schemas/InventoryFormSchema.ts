import { z } from "zod";

// ✅ Define Schema for Inventory Items
export const inventorySchema = z.object({
    dealerStoreId: z.string().min(1, "Store ID is required"),
    products: z.array(
        z.object({
            id: z.number(),
            productName: z.string(),
            quantity: z.number().min(0, "Quantity cannot be negative"),
        })
    ),
});

// ✅ TypeScript Type Inference
export type InventoryFormValues = z.infer<typeof inventorySchema>;
