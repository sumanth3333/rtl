"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";

import { fetchEmails } from "@/services/admin/monitoringService";
import { EmailStatus, MonitoringEmail, PaginatedResponse } from "@/types/monitoringTypes";
import { ApiError } from "@/services/api/errorHandler";
import { DateInput, FilterBar, FilterField, SelectInput } from "@/components/admin/monitoring/FilterBar";
import { Pagination } from "@/components/admin/monitoring/Pagination";
import { EmailStatusBadge, PillTag } from "@/components/admin/monitoring/badges";

const EMPTY_PAGE: PaginatedResponse<MonitoringEmail> = {
    content: [],
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
};

const formatDateTime = (value?: string | null) => {
    if (!value) { return "—"; }
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) { return value; }
    return d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

export default function EmailsListPage() {
    const [status, setStatus] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [page, setPage] = useState(0);

    const [data, setData] = useState<PaginatedResponse<MonitoringEmail>>(EMPTY_PAGE);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        fetchEmails({
            status: (status || undefined) as EmailStatus | undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            page,
            size: 20,
        })
            .then((res) => { if (!cancelled) { setData(res); } })
            .catch((err) => { if (!cancelled) { setError(err instanceof ApiError ? err.message : "Failed to load emails."); } })
            .finally(() => { if (!cancelled) { setLoading(false); } });
        return () => { cancelled = true; };
    }, [status, startDate, endDate, page]);

    return (
        <div className="p-3 md:p-6 space-y-4 max-w-5xl mx-auto">
            <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Email Outbox</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Delivery history for incident notification emails.</p>
            </div>

            <FilterBar>
                <FilterField label="Status">
                    <SelectInput
                        value={status}
                        onChange={(v) => { setStatus(v); setPage(0); }}
                        options={[
                            { label: "Pending", value: "PENDING" },
                            { label: "Processing", value: "PROCESSING" },
                            { label: "Retry", value: "RETRY" },
                            { label: "Sent", value: "SENT" },
                            { label: "Failed", value: "FAILED" },
                        ]}
                    />
                </FilterField>
                <FilterField label="Start date">
                    <DateInput value={startDate} onChange={(v) => { setStartDate(v); setPage(0); }} />
                </FilterField>
                <FilterField label="End date">
                    <DateInput value={endDate} onChange={(v) => { setEndDate(v); setPage(0); }} />
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
                        <div key={i} className="h-[72px] rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 animate-pulse" />
                    ))
                ) : data.content.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <Mail className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-700" />
                        No outbound emails match these filters.
                    </div>
                ) : (
                    data.content.map((email) => (
                        <Link
                            key={email.id}
                            href={`/dashboard/admin/monitoring/emails/${email.id}`}
                            className="block rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0e1729] hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-colors p-3.5 shadow-sm"
                        >
                            <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                <EmailStatusBadge status={email.status} />
                                <PillTag>{email.incident_type}</PillTag>
                                <PillTag tone="info">{email.environment}</PillTag>
                            </div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{email.title}</p>
                            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                                <span>Attempts: <span className="font-medium text-gray-700 dark:text-gray-300">{email.attempts}</span></span>
                                <span>Created: <span className="font-medium text-gray-700 dark:text-gray-300">{formatDateTime(email.created_at)}</span></span>
                                {email.last_error && <span className="text-rose-600 dark:text-rose-400">⚠ {email.last_error}</span>}
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
