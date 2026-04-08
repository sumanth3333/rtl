export interface RetentionSuggestionItem {
    month: string;
    uploadType: string;
    fromDate: string;
    toDate: string;
    suggestedUploadDate: string;
    status: "UPCOMING" | "OVERDUE" | "UPLOADED";
    fileName: string | null;
    uploadedDate: string | null;
    uploadedTime: string | null;
}

export interface RetentionSuggestionGroup {
    companyName: string;
    uploaded: RetentionSuggestionItem[];
    overdue: RetentionSuggestionItem[];
    upcoming: RetentionSuggestionItem[];
}
