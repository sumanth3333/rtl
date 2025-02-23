import apiClient from "../api/apiClient";

export interface InventoryItem {
    id: number;
    productName: string;
    quantity: number;
}

// ✅ Fetch Inventory by `dealerStoreId`
export const fetchInventory = async (dealerStoreId: string): Promise<InventoryItem[]> => {
    try {
        const url = `/inventory/store?dealerStoreId=${dealerStoreId}`;
        console.log(`Fetching inventory from: ${url}`);

        const response = await apiClient.get(url);
        console.log("Raw API Response:", response);

        if (!response.data || !Array.isArray(response.data.products)) {
            console.error("API Error: Expected 'products' array but got", response.data);
            throw new Error("Invalid API response format");
        }

        return response.data.products;
    } catch (error) {
        console.error("Error fetching inventory:", error);
        throw new Error("Failed to load inventory.");
    }
};


export const updateInventory = async (
    dealerStoreId: string,
    updatedItems: { id: number; productName: string; quantity: number }[]
) => {
    try {
        const payload = {
            dealerStoreId,
            products: updatedItems, // ✅ Matches the expected backend structure
        };

        console.log("Updating inventory with payload:", JSON.stringify(payload, null, 2));

        const response = await apiClient.put("/inventory/updateInventory", payload);
        return response.data;
    } catch (error) {
        console.error("Error updating inventory:", error);
        throw new Error("Failed to update inventory.");
    }
};
