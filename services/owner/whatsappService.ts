import whatsappApiClient from "@/services/api/whatsappApiClient";
import { EmployeeLateReasonEntry } from "@/types/lateOpeningTypes";

export async function fetchEmployeeLateReasonsByMonth(employeeNtid: string, month: string): Promise<EmployeeLateReasonEntry[]> {
    const response = await whatsappApiClient.get("/whatsapp/employeeLateReasonsByMonth", {
        params: { employeeNtid, month },
    });
    return response.data || [];
}
