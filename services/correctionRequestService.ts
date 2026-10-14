import apiClient from "./api/apiClient";
import { CorrectionRequest, CorrectionStatus, ReviewCorrectionPayload } from "@/types/employeeVerification";

export const fetchCorrectionRequests = async (status: CorrectionStatus): Promise<CorrectionRequest[]> => {
    const response = await apiClient.get<CorrectionRequest[]>("/company/viewCorrectionRequests", {
        params: { status },
    });
    return response.data ?? [];
};

export const fetchCorrectionRequestById = async (requestId: number): Promise<CorrectionRequest> => {
    const response = await apiClient.get<CorrectionRequest>(`/company/viewCorrectionRequest/${requestId}`);
    return response.data;
};

export const reviewCorrectionRequest = async (
    requestId: number,
    payload: ReviewCorrectionPayload
): Promise<CorrectionRequest> => {
    const response = await apiClient.post<CorrectionRequest>(`/company/reviewCorrectionRequest/${requestId}`, payload);
    return response.data;
};

// No dedicated count endpoint exists - the sidebar badge derives this from the PENDING list.
export const fetchPendingCorrectionRequestsCount = async (): Promise<number> => {
    try {
        const pending = await fetchCorrectionRequests("PENDING");
        return pending.length;
    } catch (error) {
        console.error("Error fetching pending correction requests count:", error);
        return 0;
    }
};
