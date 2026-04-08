import apiClient from "../api/apiClient";
import { Company } from "@/schemas/schema";
import { API_ROUTES } from "@/constants/apiRoutes";
import { FileExportPayload, SimpleCompany, UploadedReport } from "@/types/fileExportTypes";
import { RetentionSuggestionGroup } from "@/types/retentionSuggestion";
import { AxiosProgressEvent } from "axios";

export const createCompany = async (companyData: Company) => {
    return await apiClient.post(API_ROUTES.CREATE_COMPANY, companyData);
};

export const fetchAllCompanies = async (): Promise<SimpleCompany[]> => {
    const response = await apiClient.get(API_ROUTES.VIEW_ALL_COMPANIES);
    return response.data?.companies ?? [];
};

export const uploadFileExport = async (
    payload: FileExportPayload,
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
) => {
    const route = API_ROUTES.FILE_EXPORT_UPLOADS[payload.reportType];
    if (!route) {
        throw new Error("Unsupported report type.");
    }

    const formData = new FormData();
    formData.append("file", payload.file, payload.file.name);

    const response = await apiClient.post(
        route,
        formData,
        {
            params: {
                companyName: payload.companyName,
                start: payload.startDate || undefined,
                end: payload.endDate || undefined,
            },
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress,
        }
    );
    return response.data;
};

export const fetchUploadedReports = async (companyName: string, start?: string, end?: string): Promise<UploadedReport[]> => {
    const response = await apiClient.get(API_ROUTES.LAST_UPLOADED_REPORTS, {
        params: {
            companyName,
            start: start || undefined,
            end: end || undefined,
        }
    });
    return response.data || [];
};

export const fetchRetentionSuggestions = async (): Promise<RetentionSuggestionGroup[]> => {
    const response = await apiClient.get(API_ROUTES.RETENTION_SUGGESTIONS);
    return response.data ?? [];
};
