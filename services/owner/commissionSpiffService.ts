import apiClient from "../api/apiClient";
import { CommissionSpiff, SaveCommissionSpiffRequest } from "@/types/commissionSpiffTypes";

export async function fetchExistingCommissionSpiffs(companyName: string, month: string): Promise<CommissionSpiff[]> {
    const response = await apiClient.get("/commission/viewExistingCommissions", {
        params: { companyName, month },
    });
    return Array.isArray(response.data) ? response.data : [];
}

export async function saveCommissionSpiff(payload: SaveCommissionSpiffRequest): Promise<CommissionSpiff> {
    const response = await apiClient.post("/commission/save", payload);
    return response.data;
}
