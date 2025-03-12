
import { CompanyPayStructure } from "@/types/companyTypes";
import apiClient from "../api/apiClient";
import { EmployeePaycheck } from "@/types/paycheckTypes";

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

export async function fetchCompanyPayStructure(companyName: string): Promise<CompanyPayStructure> {
    const response = await apiClient.get(`company/payStructure`, {
        params: {
            companyName: companyName
        }
    });
    return response.data;
}

export async function updateCompanyPayStructure(data: CompanyPayStructure) {
    await apiClient.post(`company/payStructure`, data);
}

export const fetchEmployeePaychecks = async (
    companyName: string,
    startDate: string,
    endDate: string,
    includeBoxes: string,
    includeAccessories: string
): Promise<{ success: boolean; data?: EmployeePaycheck[]; error?: string }> => {
    try {
        const response = await apiClient.get<EmployeePaycheck[]>("/company/paycheckForEmployees", {
            params: {
                companyName,
                startDate,
                endDate,
                includeBoxesInPaycheck: includeBoxes,
                includeAccessoriesInPaycheck: includeAccessories,
            },
        });

        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, error: "Failed to fetch paycheck data." };
    }
};