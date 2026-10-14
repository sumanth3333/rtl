"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { fetchRestartDetail } from "@/services/admin/monitoringService";
import { RestartDetailResponse } from "@/types/monitoringTypes";
import { ApiError } from "@/services/api/errorHandler";
import { SeverityBadge, PillTag } from "@/components/admin/monitoring/badges";

const formatDateTime = (value?: string | null) => {
    if (!value) { return "—"; }
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) { return value; }
    return d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-4 px-3 py-2.5 text-sm">
            <span className="text-gray-500 dark:text-gray-400">{label}</span>
            <span className="text-gray-900 dark:text-gray-100 text-right">{children}</span>
        </div>
    );
}

export default function RestartDetailPage() {
    const params = useParams();
    const id = Number(params?.id);

    const [data, setData] = useState<RestartDetailResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id || Number.isNaN(id)) { return; }
        let cancelled = false;
        setLoading(true);
        setError(null);
        fetchRestartDetail(id)
            .then((res) => { if (!cancelled) { setData(res); } })
            .catch((err) => { if (!cancelled) { setError(err instanceof ApiError ? err.message : "Failed to load restart detail."); } })
            .finally(() => { if (!cancelled) { setLoading(false); } });
        return () => { cancelled = true; };
    }, [id]);

    return (
        <div className="p-3 md:p-6 space-y-4 max-w-4xl mx-auto">
            <Link href="/dashboard/admin/monitoring/restarts" className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                <ArrowLeft className="w-4 h-4" /> Back to restarts
            </Link>

            {error && (
                <div className="rounded-md bg-rose-100 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="h-64 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 animate-pulse" />
            ) : data && (
                <>
                    <div className="rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/60 dark:bg-blue-950/20 p-4">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                            <SeverityBadge severity={data.restart.severity} />
                            <PillTag tone="info">{data.restart.environment}</PillTag>
                        </div>
                        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{data.restart.title}</h1>
                        <div className="mt-2 flex items-center gap-2 text-sm">
                            <code className="rounded bg-white dark:bg-gray-900 px-2 py-1 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800">{data.restart.previous_boot_id}</code>
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                            <code className="rounded bg-indigo-50 dark:bg-indigo-950/40 px-2 py-1 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/50">{data.restart.current_boot_id}</code>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0e1729] shadow-sm divide-y divide-gray-100 dark:divide-gray-800">
                            <Row label="Detected At">{formatDateTime(data.restart.detected_at)}</Row>
                            <Row label="Previous Snapshot">{formatDateTime(data.restart.previous_snapshot_at)}</Row>
                            <Row label="Previous State">{data.restart.previous_state ?? "—"}</Row>
                            <Row label="Previous PID">{data.restart.previous_pid ?? "—"}</Row>
                            <Row label="Current PID">{data.restart.current_pid ?? "—"}</Row>
                            <Row label="Active Count">{data.restart.last_known_active_count}</Row>
                        </div>
                        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0e1729] shadow-sm divide-y divide-gray-100 dark:divide-gray-800">
                            <Row label="Linked Incident">
                                <Link href={`/dashboard/admin/monitoring/incidents/${data.restart.incident_id}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                                    #{data.restart.incident_id}
                                </Link>
                            </Row>
                            <Row label="systemd Result">{data.restart.systemd_result ?? "—"}</Row>
                            <Row label="systemd Exit Status">{data.restart.systemd_exit_status ?? "—"}</Row>
                            <Row label="Affected Requests">{data.affectedRequestCount}</Row>
                        </div>
                    </div>

                    {data.restart.diagnosis && (
                        <div className="rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-950/20 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
                            ⚠ {data.restart.diagnosis}
                        </div>
                    )}

                    <div className="space-y-2">
                        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Interrupted Requests ({data.affectedRequestCount})
                        </h2>
                        {data.affectedRequests.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400 py-6 text-center rounded-xl border border-gray-200 dark:border-gray-800">
                                No requests were interrupted by this restart.
                            </p>
                        ) : (
                            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
                                <table className="w-full text-sm text-left min-w-[640px]">
                                    <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                                        <tr>
                                            <th className="px-3 py-2 font-medium">Method</th>
                                            <th className="px-3 py-2 font-medium">Endpoint</th>
                                            <th className="px-3 py-2 font-medium">User</th>
                                            <th className="px-3 py-2 font-medium">Started</th>
                                            <th className="px-3 py-2 font-medium">Duration</th>
                                            <th className="px-3 py-2 font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-[#0e1729]">
                                        {data.affectedRequests.map((req) => (
                                            <tr key={req.id}>
                                                <td className="px-3 py-2 font-mono text-xs">{req.method}</td>
                                                <td className="px-3 py-2 font-mono text-xs">{req.endpoint}</td>
                                                <td className="px-3 py-2 text-xs">{req.username ?? "—"}</td>
                                                <td className="px-3 py-2 text-xs">{formatDateTime(req.started_at)}</td>
                                                <td className="px-3 py-2 text-xs">{(req.duration_ms / 1000).toFixed(1)}s</td>
                                                <td className="px-3 py-2">
                                                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold uppercase border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300">
                                                        {req.completion_status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
