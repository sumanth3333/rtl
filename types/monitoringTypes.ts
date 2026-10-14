// Admin monitoring: incidents, server restarts, and monitoring email delivery.
// Field names mirror the backend contract - snake_case for raw DB columns, camelCase for
// summary/pagination wrappers. See Rapid_Return_Admin_Monitoring_API_Reference.

export type IncidentSeverity = "CRITICAL" | "ERROR";
export type IncidentType = "APPLICATION_ERROR" | "SERVER_RESTART";
export type EmailStatus = "PENDING" | "PROCESSING" | "RETRY" | "SENT" | "FAILED";

export interface PaginatedResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

export interface DateRangeParams {
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
}

// --- Incidents ---------------------------------------------------------

export interface MonitoringIncident {
    id: number;
    incident_id: string;
    incident_type: IncidentType;
    severity: IncidentSeverity;
    environment: string;
    title: string;
    explanation?: string | null;
    exception_type?: string | null;
    http_method?: string | null;
    endpoint?: string | null;
    http_status?: number | null;
    username?: string | null;
    occurrence_count: number;
    first_seen_at: string;
    last_seen_at: string;
    boot_id?: string | null;
}

export interface MonitoringIncidentDetail extends MonitoringIncident {
    suggested_investigation?: string | null;
    reported_cause?: string | null;
    stack_trace?: string | null;
    fingerprint?: string | null;
    request_id?: string | null;
    user_role?: string | null;
    client_ip?: string | null;
    latitude?: number | null;
    longitude?: number | null;
}

export interface IncidentRestartRef {
    id: number;
    incident_id: number;
    detected_at: string;
}

export interface IncidentEmailRef {
    id: number;
    incident_id: number;
    status: EmailStatus;
    attempts: number;
    created_at: string;
}

export interface IncidentDetailResponse {
    incident: MonitoringIncidentDetail;
    restarts: IncidentRestartRef[];
    emails: IncidentEmailRef[];
}

export interface IncidentListParams extends DateRangeParams {
    severity?: IncidentSeverity;
    type?: IncidentType;
    environment?: string;
}

// --- Restarts ------------------------------------------------------------

export interface MonitoringRestart {
    id: number;
    incident_id: number;
    previous_boot_id: string;
    current_boot_id: string;
    previous_pid?: number | null;
    current_pid?: number | null;
    previous_state?: string | null;
    previous_snapshot_at?: string | null;
    detected_at: string;
    last_known_active_count: number;
    diagnosis?: string | null;
    systemd_result?: string | null;
    systemd_exit_status?: number | null;
    incident_uuid: string;
    incident_type: IncidentType;
    severity: IncidentSeverity;
    environment: string;
    title: string;
}

export interface MonitoringRestartRequest {
    id: number;
    restart_id: number;
    request_id: string;
    method: string;
    endpoint: string;
    username?: string | null;
    user_role?: string | null;
    client_ip?: string | null;
    started_at: string;
    duration_ms: number;
    completion_status: string;
}

export interface RestartDetailResponse {
    restart: MonitoringRestart;
    affectedRequestCount: number;
    affectedRequests: MonitoringRestartRequest[];
}

// --- Emails ----------------------------------------------------------------

export interface MonitoringEmail {
    id: number;
    incident_id: number;
    status: EmailStatus;
    attempts: number;
    next_attempt_at?: string | null;
    claimed_at?: string | null;
    sent_at?: string | null;
    last_error?: string | null;
    created_at: string;
    incident_uuid: string;
    incident_type: IncidentType;
    severity: IncidentSeverity;
    environment: string;
    title: string;
}

export interface MonitoringEmailDetail extends MonitoringEmail {
    first_seen_at: string;
    last_seen_at: string;
}

export interface EmailListParams extends DateRangeParams {
    status?: EmailStatus;
}

// --- Dashboard -----------------------------------------------------------

export interface MonitoringRecentIncident {
    id: number;
    incident_id: string;
    incident_type: IncidentType;
    severity: IncidentSeverity;
    environment: string;
    title: string;
    occurrence_count: number;
    first_seen_at: string;
    last_seen_at: string;
}

export interface MonitoringRecentRestart {
    id: number;
    incident_id: number;
    previous_boot_id: string;
    current_boot_id: string;
    previous_state?: string | null;
    detected_at: string;
    last_known_active_count: number;
    diagnosis?: string | null;
}

// --- Files -----------------------------------------------------------------

export type MonitoringFileFolder = "logs" | "monitor";

export interface MonitoringFile {
    fileName: string;
    folder: string;
    sizeBytes: number;
    lastModified: string;
}

// --- Live server health ----------------------------------------------------

export type HealthStatus = "HEALTHY" | "WARNING" | "CRITICAL" | "UNKNOWN";

export interface ServerHealthIssue {
    code: string;
    message: string;
    severity: HealthStatus;
}

export interface ServerHealthSnapshot {
    environment: string;
    applicationName: string;
    timestamp: string;
    overall: {
        status: HealthStatus;
        operationalState: string;
        ready: boolean;
        criticalCount: number;
        warningCount: number;
        unknownCount: number;
        summary: string;
    };
    server: {
        hostname: string;
        processId: number;
        operatingSystem: string;
        javaVersion: string;
        uptimeSeconds: number;
        startedAt: string;
    };
    cpu: {
        systemPercentage: number;
        processPercentage: number;
        availableProcessors: number;
        status: HealthStatus;
    };
    memory: {
        totalMB: number;
        availableMB: number;
        usedMB: number;
        usagePercentage: number;
        status: HealthStatus;
    };
    disk: {
        totalGB: number;
        freeGB: number;
        usagePercentage: number;
        status: HealthStatus;
    };
    jvm: {
        heapUsedMB: number;
        heapMaxMB: number;
        heapUsagePercentage: number;
        nonHeapUsedMB: number;
        threadCount: number;
        peakThreadCount: number;
        gcCollectionCount: number;
        gcCollectionTimeMs: number;
        status: HealthStatus;
    };
    database: {
        status: string;
        responseTimeMs: number;
        connectionPool: {
            active: number;
            idle: number;
            pending: number;
            max: number;
            usagePercentage: number;
        };
    };
    http: {
        requestsSinceStartup: number;
        serverErrorsSinceStartup: number;
        errorPercentageSinceStartup: number;
        totalErrorsSinceStartup: number;
        activeRequests: number;
        averageResponseTimeMs: number;
        topApis: {
            method: string;
            endpoint: string;
            requests: number;
            errors: number;
            averageResponseTimeMs: number;
        }[];
        status: string;
    };
    userActivity: {
        activeUsers: number;
        activeAdmins: number;
        activeOwners: number;
        activeManagers: number;
        activeEmployees: number;
    };
    restart: {
        lastStartedAt: string;
        lastRestartStatus: string;
        restartInProgress: boolean;
        restartAvailable: boolean;
    };
    issues: ServerHealthIssue[];
}

export type RestartRequestStatus = "PENDING" | "COMPLETED" | "FAILED";

export interface RestartRequest {
    requestId: string;
    status: RestartRequestStatus;
    message: string;
}

export interface MonitoringDashboard {
    startDate: string;
    endDate: string;
    totalIncidents: number;
    criticalIncidents: number;
    errorIncidents: number;
    totalRestarts: number;
    pendingEmails: number;
    failedEmails: number;
    sentEmails: number;
    incidentsByType: { incident_type: string; total: number }[];
    incidentsBySeverity: { severity: string; total: number }[];
    recentIncidents: MonitoringRecentIncident[];
    recentRestarts: MonitoringRecentRestart[];
}
