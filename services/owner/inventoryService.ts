import apiClient from "@/services/api/apiClient";

export const updateInventory = async (payload: any) => {
    try {
        //console.log("🚀 Sending Inventory Update Request:", payload);
        await apiClient.post("/manager/addInventory", payload);

        return { success: true, message: `✅ Inventory updated successfully for ${payload.dealerStoreId}` };
    } catch (error) {
        console.error(`❌ Failed to update inventory for ${payload.dealerStoreId}`, error);
        return { success: false, message: `❌ Failed to update inventory for ${payload.dealerStoreId}` };
    }
};

export const updateAccessory = async (payload: any) => {
    try {
        //console.log("🚀 Sending Inventory Update Request:", payload);
        await apiClient.post("/inventory/addAccessory", payload);

        return { success: true, message: `✅ accessories updated successfully for ${payload.dealerStoreId}` };
    } catch (error) {
        console.error(`❌ Failed to update accessories for ${payload.dealerStoreId}`, error);
        return { success: false, message: `❌ Failed to update accessories for ${payload.dealerStoreId}` };
    }
};