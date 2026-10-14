import apiClient from "./api/apiClient";
import {
    ChangeRequestPayload,
    CorrectionRequest,
    DateRangeRequest,
    DateRecord,
    VerifyDateRangeRequest,
} from "@/types/employeeVerification";

export const fetchEmployeeDateRange = async (payload: DateRangeRequest): Promise<DateRecord[]> => {
    const response = await apiClient.post<DateRecord[]>("/employee-verification/date-range", payload);
    return response.data ?? [];
};

export const verifyEmployeeDateRange = async (payload: VerifyDateRangeRequest): Promise<DateRecord[]> => {
    const response = await apiClient.post<DateRecord[]>("/employee-verification/date-range/verify", payload);
    return response.data ?? [];
};

export const submitDateRangeChangeRequest = async (payload: ChangeRequestPayload): Promise<CorrectionRequest[]> => {
    // A fresh key per call so a retried/double-clicked submission doesn't create duplicate
    // correction requests on the backend.
    const response = await apiClient.post<CorrectionRequest[]>(
        "/employee-verification/date-range/change-request",
        payload,
        { headers: { "Idempotency-Key": crypto.randomUUID() } }
    );
    return response.data ?? [];
};
