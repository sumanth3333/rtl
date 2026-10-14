"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { fetchIncidents } from "@/services/admin/monitoringService";
import { IncidentSeverity, IncidentType, MonitoringIncident, PaginatedResponse } from "@/types/monitoringTypes";
import { ApiError } from "@/services/api/errorHandler";
import { SeverityBadge, PillTag } from "@/components/admin/monitoring/badges";
import { DateInput, FilterBar, FilterField, SelectInput } from "@/components/admin/monitoring/FilterBar";
import { Pagination } from "@/components/admin/monitoring/Pagination";

const EMPTY_PAGE: PaginatedResponse<MonitoringIncident> = {
    content: [],
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
};

const formatDateTime = (value: string) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) { return value; }
    return d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

export default function IncidentsListPage() {
    const [severity, setSeverity] = useState("");
    const [type, setType] = useState("");
    const [environment, setEnvironment] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [page, setPage] = useState(0);

    const [data, setData] = useState<PaginatedResponse<MonitoringIncident>>(EMPTY_PAGE);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        fetchIncidents({
            severity: (severity || undefined) as IncidentSeverity | undefined,
            type: (type || undefined) as IncidentType | undefined,
            environment: environment || undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            page,
            size: 20,
        })
            .then((res) => { if (!cancelled) { setData(res); } })
            .catch((err) => { if (!cancelled) { setError(err instanceof ApiError ? err.message : "Failed to load incidents."); } })
            .finally(() => { if (!cancelled) { setLoading(false); } });
        return () => { cancelled = true; };
    }, [severity, type, environment, startDate, endDate, page]);

    const resetToFirstPage = (setter: (v: string) => void) => (value: string) => {
        setter(value);
        setPage(0);
    };

    return (
        <div className="p-3 md:p-6 space-y-4 max-w-5xl mx-auto">
            <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Incidents</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Application errors and server restarts captured by monitoring.</p>
            </div>

            <FilterBar>
                <FilterField label="Severity">
                    <SelectInput
                        value={severity}
                        onChange={resetToFirstPage(setSeverity)}
                        options={[{ label: "Critical", value: "CRITICAL" }, { label: "Error", value: "ERROR" }]}
                    />
                </FilterField>
                <FilterField label="Type">
                    <SelectInput
                        value={type}
                        onChange={resetToFirstPage(setType)}
                        options={[{ label: "Application Error", value: "APPLICATION_ERROR" }, { label: "Server Restart", value: "SERVER_RESTART" }]}
                    />
                </FilterField>
                <FilterField label="Environment">
                    <SelectInput
                        value={environment}
                        onChange={resetToFirstPage(setEnvironment)}
                        options={[{ label: "prod", value: "prod" }, { label: "staging", value: "staging" }]}
                    />
                </FilterField>
                <FilterField label="Start date">
                    <DateInput value={startDate} onChange={resetToFirstPage(setStartDate)} />
                </FilterField>
                <FilterField label="End date">
                    <DateInput value={endDate} onChange={resetToFirstPage(setEndDate)} />
                </FilterField>
            </FilterBar>

            {error && (
                <div className="rounded-md bg-rose-100 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-[84px] rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 animate-pulse" />
                    ))
                ) : data.content.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-700" />
                        No incidents match these filters.
                    </div>
                ) : (
                    data.content.map((incident) => (
                        <Link
                            key={incident.id}
                            href={`/dashboard/admin/monitoring/incidents/${incident.id}`}
                            className="block rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0e1729] hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-colors p-3.5 shadow-sm"
                        >
                            <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                <SeverityBadge severity={incident.severity} />
                                <PillTag>{incident.incident_type}</PillTag>
                                <PillTag tone="info">{incident.environment}</PillTag>
                                {incident.http_status && <PillTag>{incident.http_method} {incident.http_status}</PillTag>}
                            </div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{incident.title}</p>
                            {incident.endpoint && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono">{incident.endpoint}</p>
                            )}
                            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                                <span>Occurrences: <span className="font-medium text-gray-700 dark:text-gray-300">{incident.occurrence_count}</span></span>
                                <span>Last seen: <span className="font-medium text-gray-700 dark:text-gray-300">{formatDateTime(incident.last_seen_at)}</span></span>
                            </div>
                        </Link>
                    ))
                )}
            </div>

            <Pagination
                page={data.page}
                totalPages={data.totalPages}
                totalElements={data.totalElements}
                hasNext={data.hasNext}
                hasPrevious={data.hasPrevious}
                onPageChange={setPage}
            />
        </div>
    );
}
