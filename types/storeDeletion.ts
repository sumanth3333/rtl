export type StoreDeletionStatus =
    | "REQUESTED"
    | "PROCESSING"
    | "WAITING_FOR_COMPANY_APPROVAL"
    | "APPROVED"
    | "DELETING"
    | "DELETED"
    | "REJECTED"
    | "BACKUP_OUTDATED"
    | "FAILED"
    | "RESTORED";

// Shared by both "request deletion" (OWNER) and "process request" (ADMIN) responses.
// Confirmed from a live response - richer than the PDF's "representative" example, which
// used "id"/"companyId" and omitted the audit fields below entirely.
export type StoreDeletionRequestResponse = {
    requestId: number;
    storeId: number;
    dealerStoreId: string;
    companyName: string;
    requestedBy: string;
    requestedByName: string;
    requestedAt: string;
    processedBy: string | null;
    processedByName: string | null;
    processedAt: string | null;
    approvedBy: string | null;
    approvedByName: string | null;
    approvedAt: string | null;
    deletedAt: string | null;
    status: StoreDeletionStatus;
};

// GET /v1/store-deletion/admin/deletion-requests — pending requests an admin can process.
export type StoreDeletionPendingRequest = {
    requestId: number;
    storeName: string;
    companyName: string;
};

// GET /v1/store-deletion/approval?token=...
export type StoreDeletionApprovalResponse = {
    requestId: number;
    dealerStoreId: string;
    status: StoreDeletionStatus;
    approvalExpiresAt: string;
    backupSummary: {
        recordCounts: Record<string, number>;
    };
};

// POST /v1/store-deletion/approval/confirm?token=...
export type StoreDeletionResult = {
    requestId: number;
    dealerStoreId: string;
    status: StoreDeletionStatus;
    message: string;
};

// GET /v1/store-deletion/admin/deleted-requests
export type DeletedStoreRequest = {
    requestId: number;
    storeId: number;
    dealerStoreId: string;
    companyId: number;
    status: StoreDeletionStatus;
    deletedAt: string;
    restoreDeadline: string;
    totalRecords: number;
    totalTables: number;
    canRestore: boolean;
};

// POST /v1/store-deletion/restore/{requestId}
export type StoreRestoreResult = {
    requestId: number;
    storeId: number;
    dealerStoreId: string;
    status: StoreDeletionStatus;
    totalRestoredRecords: number;
    totalRestoredTables: number;
    restoredAt: string;
    message: string;
};

export type StoreDeletionAuthorizationState =
    | "loading"
    | "ready"
    | "approving"
    | "rejecting"
    | "deleted"
    | "rejected"
    | "terminal_error"
    | "backup_outdated"
    | "failed";
