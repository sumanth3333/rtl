import apiClient from "./api/apiClient";
import { API_ROUTES } from "@/constants/apiRoutes";
import { ManualClockInPayload, ManualClockInResponse } from "@/types/manualClockInTypes";

// ✅ Backup path for when an employee can't sign in themselves - an admin or the store owner
// clocks them in manually. Backend returns 409 (not thrown as a generic error) when the
// employee already has an open clock-in, so callers should let that surface via ApiError.message.
export const adminManualClockIn = async (payload: ManualClockInPayload): Promise<ManualClockInResponse> => {
    const response = await apiClient.post<ManualClockInResponse>(API_ROUTES.MANUAL_CLOCK_IN.ADMIN, payload);
    return response.data;
};

export const companyManualClockIn = async (payload: ManualClockInPayload): Promise<ManualClockInResponse> => {
    const response = await apiClient.post<ManualClockInResponse>(API_ROUTES.MANUAL_CLOCK_IN.COMPANY, payload);
    return response.data;
};
