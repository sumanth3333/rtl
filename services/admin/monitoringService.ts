import apiClient from "../api/apiClient";
import { ApiError } from "../api/errorHandler";
import { API_ROUTES } from "@/constants/apiRoutes";
import {
    DateRangeParams,
    EmailListParams,
    IncidentDetailResponse,
    IncidentListParams,
    MonitoringDashboard,
    MonitoringEmail,
    MonitoringEmailDetail,
    MonitoringFile,
    MonitoringIncident,
    MonitoringRestart,
    PaginatedResponse,
    RestartDetailResponse,
    RestartRequest,
    ServerHealthSnapshot,
} from "@/types/monitoringTypes";

export const fetchMonitoringDashboard = async (
    params?: { startDate?: string; endDate?: string }
): Promise<MonitoringDashboard> => {
    const response = await apiClient.get<MonitoringDashboard>(API_ROUTES.MONITORING.DASHBOARD, { params });
    return response.data;
};

export const fetchIncidents = async (
    params?: IncidentListParams
): Promise<PaginatedResponse<MonitoringIncident>> => {
    const response = await apiClient.get<PaginatedResponse<MonitoringIncident>>(API_ROUTES.MONITORING.INCIDENTS, { params });
    return response.data;
};

export const fetchIncidentDetail = async (id: number): Promise<IncidentDetailResponse> => {
    const response = await apiClient.get<IncidentDetailResponse>(`${API_ROUTES.MONITORING.INCIDENTS}/${id}`);
    return response.data;
};

export const fetchRestarts = async (
    params?: DateRangeParams
): Promise<PaginatedResponse<MonitoringRestart>> => {
    const response = await apiClient.get<PaginatedResponse<MonitoringRestart>>(API_ROUTES.MONITORING.RESTARTS, { params });
    return response.data;
};

export const fetchRestartDetail = async (id: number): Promise<RestartDetailResponse> => {
    const response = await apiClient.get<RestartDetailResponse>(`${API_ROUTES.MONITORING.RESTARTS}/${id}`);
    return response.data;
};

export const fetchEmails = async (
    params?: EmailListParams
): Promise<PaginatedResponse<MonitoringEmail>> => {
    const response = await apiClient.get<PaginatedResponse<MonitoringEmail>>(API_ROUTES.MONITORING.EMAILS, { params });
    return response.data;
};

export const fetchEmailDetail = async (id: number): Promise<MonitoringEmailDetail> => {
    const response = await apiClient.get<MonitoringEmailDetail>(`${API_ROUTES.MONITORING.EMAILS}/${id}`);
    return response.data;
};

export const fetchServerHealth = async (): Promise<ServerHealthSnapshot> => {
    const response = await apiClient.get<ServerHealthSnapshot>(API_ROUTES.MONITORING.SERVER);
    return response.data;
};

export const triggerServerRestart = async (reason: string): Promise<RestartRequest> => {
    const response = await apiClient.post<RestartRequest>(API_ROUTES.MONITORING.SERVER_RESTART, { reason });
    return response.data;
};

export const fetchRestartRequestStatus = async (requestId: string): Promise<RestartRequest> => {
    const response = await apiClient.get<RestartRequest>(`${API_ROUTES.MONITORING.SERVER_RESTART}/${requestId}`);
    return response.data;
};

export const fetchAllMonitoringFiles = async (): Promise<MonitoringFile[]> => {
    const response = await apiClient.get<MonitoringFile[]>(API_ROUTES.MONITORING.FILES);
    return response.data ?? [];
};

export const fetchMonitoringFilesByFolder = async (folder: string): Promise<MonitoringFile[]> => {
    const response = await apiClient.get<MonitoringFile[]>(`${API_ROUTES.MONITORING.FILES}/${folder}`);
    return response.data ?? [];
};

// ✅ responseType "blob" makes axios return the error body as a Blob too (not parsed JSON),
// so the shared error handler can't read a message out of it - re-resolve it here instead.
const resolveBlobError = async (err: unknown): Promise<never> => {
    if (err instanceof ApiError && err.data instanceof Blob) {
        const text = await err.data.text().catch(() => "");
        let message = text || err.message;
        let parsedData: unknown = text;
        try {
            const parsed = JSON.parse(text);
            message = parsed.message || parsed.error || message;
            parsedData = parsed;
        } catch {
            // plain-text error body - keep as-is
        }
        throw new ApiError(message, err.status, parsedData);
    }
    throw err;
};

export const downloadMonitoringFile = async (folder: string, fileName: string): Promise<void> => {
    try {
        const response = await apiClient.get(`${API_ROUTES.MONITORING.FILES}/download`, {
            params: { folder, fileName },
            responseType: "blob",
        });
        const url = window.URL.createObjectURL(response.data as Blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (err) {
        await resolveBlobError(err);
    }
};

export interface MonitoringFilePreview {
    content: string;
    truncated: boolean;
}

// Keeps the preview modal responsive on multi-megabyte logs - full content is always one
// "Download" click away.
const MAX_PREVIEW_CHARS = 400_000;

const blobToText = async (blob: Blob, isGzip: boolean): Promise<string> => {
    if (!isGzip) {
        return blob.text();
    }
    if (typeof DecompressionStream === "undefined") {
        throw new ApiError("This browser can't decompress .gz files for preview - please download it instead.", 0);
    }
    const stream = blob.stream().pipeThrough(new DecompressionStream("gzip"));
    return new Response(stream).text();
};

export const previewMonitoringFile = async (folder: string, fileName: string): Promise<MonitoringFilePreview> => {
    try {
        const response = await apiClient.get(`${API_ROUTES.MONITORING.FILES}/download`, {
            params: { folder, fileName },
            responseType: "blob",
        });
        const text = await blobToText(response.data as Blob, fileName.endsWith(".gz"));
        const truncated = text.length > MAX_PREVIEW_CHARS;
        return { content: truncated ? text.slice(0, MAX_PREVIEW_CHARS) : text, truncated };
    } catch (err) {
        return resolveBlobError(err);
    }
};
