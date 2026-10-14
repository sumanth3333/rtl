// clockOutTime/hours are null while the session is still open (employee hasn't clocked out yet) -
// confirmed from a live incompleteWork entry.
export type WorkEntry = {
    workId: number;
    clockInTime: string;
    clockOutTime: string | null;
    hours: number | null;
    editable: boolean;
};

export type SaleEntry = {
    saleId: number;
    activations: number;
    upgrades: number;
    bts: number;
    hsi: number;
    promotionalLines: number;
    saleCredit: boolean;
    editable: boolean;
};

export type ExcludedPhone = {
    phoneId: number;
    invoiceId: number;
    productName: string;
    status: string;
};

export type ActivationsSummary = {
    raw: number;
    excluded: number;
    net: number;
    mismatch: boolean;
    excludedPhones: ExcludedPhone[];
};

// Read-only in this flow - the spec doesn't document editing migrations via change-request.
export type MigrationEntry = {
    id?: number;
    lines?: number;
    status?: string;
    editable?: boolean;
    [key: string]: unknown;
};

export type VerificationStatus = "VERIFIED" | "NOT_VERIFIED";

export type StoreDayRecord = {
    dealerStoreId: string;
    storeName: string;
    actualWork: WorkEntry[];
    incompleteWork: WorkEntry[];
    salesCreditWork: WorkEntry[];
    regularSales: SaleEntry[];
    creditedSales: SaleEntry[];
    unclassifiedSales: SaleEntry[];
    activations: ActivationsSummary;
    migrations: MigrationEntry[];
    verificationStatus: VerificationStatus;
    snapshotHash: string;
};

export type DateRecord = {
    date: string;
    stores: StoreDayRecord[];
};

export type DateRangeRequest = {
    employeeNtid: string;
    secureCode: string;
    fromDate: string;
    toDate: string;
};

export type VerificationItem = {
    date: string;
    dealerStoreId: string;
    snapshotHash: string;
};

export type VerifyDateRangeRequest = DateRangeRequest & {
    verifications: VerificationItem[];
};

export type ChangeTargetKind = "WORK" | "SALE";

// Observed field names from the spec's examples - not exhaustive, so kept as string on the
// wire type, with a curated option list in the UI.
export type ChangeFieldName = "CLOCK_IN_TIME" | "CLOCK_OUT_TIME" | "ACTIVATIONS" | "UPGRADES" | "BTS" | "HSI" | "PROMOTIONAL_LINES";

export type ChangeInput = {
    targetKind: ChangeTargetKind;
    targetId: number;
    fieldName: string;
    requestedValue: string;
};

export type DateChangeGroup = {
    date: string;
    dealerStoreId: string;
    snapshotHash: string;
    reason: string;
    changes: ChangeInput[];
};

export type ChangeRequestPayload = DateRangeRequest & {
    changes: DateChangeGroup[];
};

export type CorrectionStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "CONFLICTED";

export type CorrectionChange = {
    id: number;
    targetKind: ChangeTargetKind;
    targetId: number;
    fieldName: string;
    originalValue: string;
    requestedValue: string;
};

export type CorrectionRequest = {
    requestId: number;
    employeeId: number;
    storeId: number;
    date: string;
    status: CorrectionStatus;
    reason: string;
    ownerComments: string | null;
    changes: CorrectionChange[];
};

export type ReviewCorrectionPayload = {
    approve: boolean;
    comments: string;
};
