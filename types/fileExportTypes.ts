export interface SimpleCompany {
    companyId: number;
    companyName: string;
}

export type FileExportType = "activation" | "saleDetail" | "callidus" | "retentionReport";

export interface FileExportPayload {
    companyName: string;
    startDate?: string; // YYYY-MM-DD
    endDate?: string; // YYYY-MM-DD
    file: File;
    reportType: FileExportType;
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
