import type { StoreCurrentTrends } from "@/types/storeTrends";
import apiClient from "../api/apiClient";

export async function getStoreCurrentTrends(dealerStoreId: string) {
    if (!dealerStoreId) return null;

    // If your apiClient returns { data }, keep this:
    const { data } = await apiClient.get<StoreCurrentTrends>(
        `/store/currentTrends`,
        { params: { dealerStoreId } }
    );

    return data;
}
