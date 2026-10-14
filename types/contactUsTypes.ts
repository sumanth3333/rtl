export type ContactRequestSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type ContactRequestType = "EMPLOYEE" | "COMPANY";
export type ContactRequestStatus = "NEW" | "IN_PROGRESS" | "RESOLVED" | "NOT_RESOLVED";

export interface ContactUsSubmitPayload {
    requestedUser: string;
    secureCode?: string;
    concern: string;
    severity: ContactRequestSeverity;
}

export interface ContactRequest {
    requestId: number;
    requestType: ContactRequestType;
    employeeId: number | null;
    companyId: number | null;
    companyName: string | null;
    requestedUser: string;
    requesterName: string;
    requesterEmail: string | null;
    requesterPhone: string | null;
    concern: string;
    severity: ContactRequestSeverity;
    status: ContactRequestStatus;
    requestedAt: string;
    assignedAdminUsername: string | null;
    startedAt: string | null;
    closedAt: string | null;
    resolution: string | null;
    nonResolutionReason: string | null;
    resolutionDurationSeconds: number | null;
    timeSpent: string | null;
    contactDetailsVisible: boolean;
}
