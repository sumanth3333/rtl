
import { CompanyPayStructure } from "@/types/companyTypes";
import apiClient from "../api/apiClient";

export const fetchCommissionSettings = async () => {
    const response = await fetch("/api/commission-settings");
    return response.json();
};

export const saveCommissionSettings = async (settings: any) => {
    await fetch("/api/commission-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
    });
};

export async function fetchCompanyPayStructure(): Promise<CompanyPayStructure> {
    const response = await apiClient.get(`company/payStructure`);
    return response.data;
}

export async function updateCompanyPayStructure(data: CompanyPayStructure) {
    await apiClient.post(`company/payStructure`, data);
}
