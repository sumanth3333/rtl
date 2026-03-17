export interface SimpleCompany {
    companyId: number;
    companyName: string;
}

export interface FileExportPayload {
    companyName: string;
    startDate?: string; // YYYY-MM-DD
    endDate?: string; // YYYY-MM-DD
    file: File;
}

export interface FileExportResult {
    totalRecords: number;
    successCount: number;
    skippedFeatureCount: number;
    errorCount: number;
    duplicateCount: number;
    processingTime: string;
}

export interface UploadedReport {
    startDate: string;
    endDate: string;
    uploadedDate: string;
    uploadedTime: string;
    fileName: string;
}
