import apiClient from "../api/apiClient";
import { GenerateScheduleRequest, GenerateScheduleResponse, SaveScheduleRequest, UpdateScheduleRequest } from "@/types/scheduleTypes";

// ✅ The backend can serialize java.time.LocalDate as a "yyyy-MM-dd" string or as a [year, month, day] array
// depending on Jackson config - normalize to a string here so every consumer can trust `date: string`.
const toDateString = (value: unknown): string => {
    if (typeof value === "string") { return value; }
    if (Array.isArray(value) && value.length >= 3) {
        const [year, month, day] = value as number[];
        return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
    return value == null ? "" : String(value);
};

export async function generateSchedule(payload: GenerateScheduleRequest): Promise<GenerateScheduleResponse> {
    const response = await apiClient.post<GenerateScheduleResponse>("/employee-schedule/generate", payload);
    const data = response.data;
    return {
        ...data,
        stores: (data.stores ?? []).map((store) => ({
            ...store,
            days: (store.days ?? []).map((day) => ({
                ...day,
                date: toDateString(day.date),
            })),
        })),
    };
}

export async function saveSchedule(payload: SaveScheduleRequest): Promise<void> {
    await apiClient.post("/employee-schedule/save", payload);
}

export async function updateEmployeeSchedule(payload: UpdateScheduleRequest): Promise<void> {
    await apiClient.post("/employee-schedule/update", payload);
}
