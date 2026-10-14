import apiClient from "./api/apiClient";
import {
    DeletedStoreRequest,
    StoreDeletionApprovalResponse,
    StoreDeletionPendingRequest,
    StoreDeletionRequestResponse,
    StoreDeletionResult,
    StoreRestoreResult,
} from "@/types/storeDeletion";

// Latitude/Longitude audit headers are attached automatically by apiClient's request
// interceptor (same as Timezone) - no per-call plumbing needed here.

// ---- OWNER ----

export const requestStoreDeletion = async (dealerStoreId: string): Promise<StoreDeletionRequestResponse> => {
    const response = await apiClient.post<StoreDeletionRequestResponse>(`/store-deletion/request/${dealerStoreId}`);
    return response.data;
};

export const fetchStoreDeletionApproval = async (token: string): Promise<StoreDeletionApprovalResponse> => {
    const response = await apiClient.get<StoreDeletionApprovalResponse>("/store-deletion/approval", {
        params: { token },
    });
    return response.data;
};

export const confirmStoreDeletion = async (token: string): Promise<StoreDeletionResult> => {
    const response = await apiClient.post<StoreDeletionResult>("/store-deletion/approval/confirm", null, {
        params: { token },
    });
    return response.data;
};

export const rejectStoreDeletion = async (token: string): Promise<string> => {
    const response = await apiClient.post<string>("/store-deletion/approval/reject", null, {
        params: { token },
    });
    return response.data;
};

// ---- ADMIN ----

export const fetchPendingStoreDeletionRequests = async (): Promise<StoreDeletionPendingRequest[]> => {
    const response = await apiClient.get<StoreDeletionPendingRequest[]>("/store-deletion/admin/deletion-requests");
    return response.data ?? [];
};

export const adminProcessStoreDeletion = async (requestId: number): Promise<StoreDeletionRequestResponse> => {
    const response = await apiClient.post<StoreDeletionRequestResponse>(`/store-deletion/admin/process/${requestId}`);
    return response.data;
};

export const fetchDeletedStoreRequests = async (): Promise<DeletedStoreRequest[]> => {
    const response = await apiClient.get<DeletedStoreRequest[]>("/store-deletion/admin/deleted-requests");
    return response.data ?? [];
};

export const restoreStoreDeletion = async (requestId: number): Promise<StoreRestoreResult> => {
    const response = await apiClient.post<StoreRestoreResult>(`/store-deletion/restore/${requestId}`);
    return response.data;
};
