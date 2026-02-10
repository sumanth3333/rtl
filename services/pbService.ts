
import type { ExpectedPBResponse, SetPbCommissionRequest, ViewCommissionResponse } from "@/types/pb";
import apiClient from "./api/apiClient";

export const pbService = {
    viewCommission(companyName: string) {
        return apiClient.get<ViewCommissionResponse>("/company/viewCommission", { params: { companyName } });
    },
    setPbCommission(payload: SetPbCommissionRequest) {
        return apiClient.post("/company/setPbCommission", payload);
    },
    expectedPerformanceBonus(companyName: string, month: string) {
        return apiClient.get<ExpectedPBResponse>("/company/expectedPerformanceBonus", {
            params: { companyName, month },
        });
    },
};
