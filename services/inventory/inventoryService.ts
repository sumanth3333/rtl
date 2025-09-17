import apiClient from "../api/apiClient";

export interface InventoryItem {
    id: number;
    productName: string;
    quantity: number;
}

// New interfaces for grouped inventory
export interface InventoryGrouped {
    brand: string;
    inStock: InventoryItem[];
    outofStock: InventoryItem[];
}

export interface StoreInventoryResponse {
    updatedDate: string;
    updatedTime: string;
    updatedPerson: string;
    storeInventory: InventoryGrouped[];
}


// ✅ Flatten helper (for form/editing + updates)
export const flattenStoreInventory = (storeInventory: StoreInventoryResponse["storeInventory"]): InventoryItem[] => {
    const all: InventoryItem[] = [];
    for (const group of storeInventory) {
        for (const item of group.inStock) all.push({ id: item.id, productName: item.productName, quantity: item.quantity });
        for (const item of group.outofStock) all.push({ id: item.id, productName: item.productName, quantity: item.quantity });
    }
    return all;
};

// ✅ Updated fetch: now returns grouped response
export const fetchInventory = async (dealerStoreId: string): Promise<StoreInventoryResponse> => {
    try {
        const url = `/inventory/store?dealerStoreId=${dealerStoreId}`;
        const response = await apiClient.get(url);

        if (!response.data || !Array.isArray(response.data.storeInventory)) {
            console.error("API Error: Expected 'storeInventory' array but got", response.data);
            throw new Error("Invalid API response format");
        }

        return response.data as StoreInventoryResponse;
    } catch (error) {
        console.error("Error fetching inventory:", error);
        throw new Error("Failed to load inventory.");
    }
};
export const updateInventory = async (
    dealerStoreId: string,
    updatedItems: { id: number; productName: string; quantity: number }[],
    employeeNtid: string
) => {
    try {
        const payload = {
            dealerStoreId,
            products: updatedItems,
            employeeNtid // ✅ Matches the expected backend structure
        };
        const response = await apiClient.put("/inventory/updateInventory", payload);
        return response.data;
    } catch (error) {
        console.error("Error updating inventory:", error);
        throw new Error("Failed to update inventory.");
    }
};
