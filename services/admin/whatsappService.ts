import whatsappApiClient from "../api/whatsappApiClient";
import { LateOpeningDetailsResponse } from "@/types/lateOpeningTypes";

export async function fetchLateOpeningDetails(companyName: string, date: string): Promise<LateOpeningDetailsResponse> {
    const response = await whatsappApiClient.get("/whatsapp/lateOpeningDetails", {
        params: { companyName, date },
    });
    return response.data;
}
