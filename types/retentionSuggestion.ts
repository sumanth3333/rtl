export type ReportUploadSuggestionStatus = "UPLOADED" | "PENDING" | "OVERDUE" | "UPCOMING";

export interface ReportUploadSuggestionItem {
    reportType?: string;
    startDate?: string;
    endDate?: string;
    expectedUploadDate?: string;
    status?: ReportUploadSuggestionStatus;
    message?: string;

    // Legacy retention suggestions fields (kept for backward compatibility)
    month?: string;
    uploadType?: string;
    fromDate?: string;
    toDate?: string;
    suggestedUploadDate?: string;
    fileName?: string | null;
    uploadedDate?: string | null;
    uploadedTime?: string | null;
}

export interface ReportUploadSuggestionGroup {
    companyName: string;
    uploaded: ReportUploadSuggestionItem[];
    pending?: ReportUploadSuggestionItem[];
    overdue: ReportUploadSuggestionItem[];
    upcoming?: ReportUploadSuggestionItem[];
}
