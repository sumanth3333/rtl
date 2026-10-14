"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw } from "lucide-react";

import { fetchRestarts } from "@/services/admin/monitoringService";
import { MonitoringRestart, PaginatedResponse } from "@/types/monitoringTypes";
import { ApiError } from "@/services/api/errorHandler";
import { DateInput, FilterBar, FilterField } from "@/components/admin/monitoring/FilterBar";
import { Pagination } from "@/components/admin/monitoring/Pagination";

const EMPTY_PAGE: PaginatedResponse<MonitoringRestart> = {
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

export default function RestartsListPage() {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [page, setPage] = useState(0);

    const [data, setData] = useState<PaginatedResponse<MonitoringRestart>>(EMPTY_PAGE);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        fetchRestarts({ startDate: startDate || undefined, endDate: endDate || undefined, page, size: 20 })
            .then((res) => { if (!cancelled) { setData(res); } })
            .catch((err) => { if (!cancelled) { setError(err instanceof ApiError ? err.message : "Failed to load restarts."); } })
            .finally(() => { if (!cancelled) { setLoading(false); } });
        return () => { cancelled = true; };
    }, [startDate, endDate, page]);

    return (
        <div className="p-3 md:p-6 space-y-4 max-w-5xl mx-auto">
            <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Server Restarts</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Detected process restarts and the requests interrupted by each one.</p>
            </div>

            <FilterBar>
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
                        <RotateCcw className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-700" />
                        No restarts found for this period.
                    </div>
                ) : (
                    data.content.map((restart) => (
                        <Link
                            key={restart.id}
                            href={`/dashboard/admin/monitoring/restarts/${restart.id}`}
                            className="block rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0e1729] hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-colors p-3.5 shadow-sm"
                        >
                            <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                <code className="text-xs rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-gray-700 dark:text-gray-300">{restart.previous_boot_id}</code>
                                <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                                <code className="text-xs rounded bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 text-indigo-700 dark:text-indigo-300">{restart.current_boot_id}</code>
                            </div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{restart.title}</p>
                            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                                <span>Detected: <span className="font-medium text-gray-700 dark:text-gray-300">{formatDateTime(restart.detected_at)}</span></span>
                                <span>Active count: <span className="font-medium text-gray-700 dark:text-gray-300">{restart.last_known_active_count}</span></span>
                            </div>
                            {restart.diagnosis && (
                                <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">⚠ {restart.diagnosis}</p>
                            )}
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
