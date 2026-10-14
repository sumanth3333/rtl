import apiClient from "../api/apiClient";
import { DayAvailability, SaveAvailabilityPayload } from "@/types/scheduleAvailabilityTypes";

export async function fetchSubmittedAvailability(employeeNtid: string, month: string): Promise<DayAvailability[]> {
    const response = await apiClient.get<DayAvailability[]>("/employee-availability/viewSubmitted", {
        params: { employeeNtid, month },
    });
    return response.data ?? [];
}

export async function saveAvailability(payload: SaveAvailabilityPayload): Promise<void> {
    await apiClient.post("/employee-availability/save", payload);
}
