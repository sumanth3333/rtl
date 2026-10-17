import apiClient from "../api/apiClient";
import { API_ROUTES } from "@/constants/apiRoutes";
import { StoreAddress, UpdateStoreAddressPayload } from "@/types/storeAddressTypes";

export const fetchStoreAddress = async (dealerStoreId: string): Promise<StoreAddress> => {
    const response = await apiClient.get<StoreAddress>(API_ROUTES.STORE_ADDRESS.GET, {
        params: { dealerStoreId },
    });
    return response.data;
};

// ✅ Mutates an existing store's address, so this backend expects PUT (its /update-suffixed
// action endpoints are all updates to an existing resource, never creations).
export const updateStoreAddress = async (payload: UpdateStoreAddressPayload): Promise<StoreAddress> => {
    const response = await apiClient.put<StoreAddress>(API_ROUTES.STORE_ADDRESS.UPDATE, payload);
    return response.data;
};
