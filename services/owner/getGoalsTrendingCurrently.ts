// src/services/owner/ownerService.ts

import type { AxiosError } from "axios";
import apiClient from "../api/apiClient";
import { GoalsTrendingCurrentlyItem } from "@/types/goalsTrending";

// ---------- Types ----------
export type GoalsTrendingStore = {
    dealerStoreId: string;
    storeName: string;
};

// ---------- Service ----------
export async function getGoalsTrendingCurrently(
    companyName: string
): Promise<GoalsTrendingCurrentlyItem[]> {
    try {
        const res = await apiClient.get<GoalsTrendingCurrentlyItem[]>(
            "/company/goalsTrendingCurrently",
            {
                params: { companyName },
            }
        );

        return res.data ?? [];
    } catch (e) {
        const err = e as AxiosError<any>;
        console.error(
            "getGoalsTrendingCurrently failed:",
            err?.response?.status,
            err?.response?.data ?? err?.message
        );

        // keep your dashboard stable (same style as your other services)
        return [];
    }
}
