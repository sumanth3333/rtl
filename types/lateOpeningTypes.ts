export interface LateOpeningStatus {
    openingStatus: "ON_TIME" | "LATE";
    messageDeliveryStatus?: "SENT" | "DELIVERED" | "READ" | "FAILED";
    replied?: boolean;
    allowEodSubmission?: boolean;
    allowEodForNonDelivery?: boolean;
}

export interface LateOpeningMessageDetail {
    messageType: string;
    reminderNumber: number;
    retryCount: number;
    deliveryStatus: string;
    acceptedAt: string | null;
    sentAt: string | null;
    deliveredAt: string | null;
    readAt: string | null;
    failedAt: string | null;
    failureReason: string | null;
}

export interface LateOpeningEntry {
    reasonId: number;
    dealerStoreId: string;
    storeName: string;
    storeContact: string;
    employeeName: string;
    employeePhoneNumber: string;
    scheduledOpeningTime: string;
    employeeClockInTime: string;
    lateDurationSeconds: number;
    lateDuration: string;
    responseReceived: boolean;
    reasonReplied: string | null;
    repliedAt: string | null;
    repliedAfter: string | null;
    remindersBeforeReply: number | null;
    responseTimeSeconds: number | null;
    responseTime: string | null;
    repliedWithoutReminder: boolean | null;
    severity: string | null;
    currentStatus: string;
    actionRequired: string | null;
    messageDetails: LateOpeningMessageDetail[];
}

export interface LateOpeningDetailsResponse {
    totalLateOpenings: number;
    totalReplied: number;
    totalAwaitingReply: number;
    repliedAfterInitialMessage: number;
    repliedAfterReminder1: number;
    repliedAfterReminder2: number;
    neverReplied: number;
    averageLateDurationSeconds: number;
    averageLateDuration: string;
    averageResponseTimeSeconds: number;
    averageResponseTime: string;
    lateOpenings: LateOpeningEntry[];
}

export interface EmployeeLateReasonEntry {
    storeId: string;
    date: string;
    scheduledOpeningTime: string;
    employeeClockInTime: string;
    lateDuration: string;
    lateReason: string | null;
    repliedTime: string | null;
    status: string;
    remarks: string[];
}
