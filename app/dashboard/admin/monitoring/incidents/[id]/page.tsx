"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, RotateCcw } from "lucide-react";

import { fetchIncidentDetail } from "@/services/admin/monitoringService";
import { IncidentDetailResponse } from "@/types/monitoringTypes";
import { ApiError } from "@/services/api/errorHandler";
import { SeverityBadge, PillTag, EmailStatusBadge } from "@/components/admin/monitoring/badges";

const formatDateTime = (value?: string | null) => {
    if (!value) { return "—"; }
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) { return value; }
    return d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 break-words">{children}</p>
        </div>
    );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{children}</h2>;
}

export default function IncidentDetailPage() {
    const params = useParams();
    const id = Number(params?.id);

    const [data, setData] = useState<IncidentDetailResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id || Number.isNaN(id)) { return; }
        let cancelled = false;
        setLoading(true);
        setError(null);
        fetchIncidentDetail(id)
            .then((res) => { if (!cancelled) { setData(res); } })
            .catch((err) => { if (!cancelled) { setError(err instanceof ApiError ? err.message : "Failed to load incident detail."); } })
            .finally(() => { if (!cancelled) { setLoading(false); } });
        return () => { cancelled = true; };
    }, [id]);

    return (
        <div className="p-3 md:p-6 space-y-4 max-w-4xl mx-auto">
            <Link href="/dashboard/admin/monitoring/incidents" className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                <ArrowLeft className="w-4 h-4" /> Back to incidents
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
                    <div className="rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-950/20 p-4">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                <SeverityBadge severity={data.incident.severity} />
                                <PillTag>{data.incident.incident_type}</PillTag>
                                <PillTag tone="info">{data.incident.environment}</PillTag>
                            </div>
                        </div>
                        <h1 className="mt-2 text-lg font-semibold text-gray-900 dark:text-gray-100">{data.incident.title}</h1>
                        {data.incident.explanation && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{data.incident.explanation}</p>
                        )}
                    </div>

                    <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <Field label="HTTP Status">{data.incident.http_status ?? "—"}</Field>
                        <Field label="Occurrences">{data.incident.occurrence_count}</Field>
                        <Field label="Restarts">{data.restarts.length}</Field>
                        <Field label="Emails">{data.emails.length}</Field>
                    </section>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <SectionTitle>Request Info</SectionTitle>
                            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0e1729] shadow-sm divide-y divide-gray-100 dark:divide-gray-800">
                                <Row label="Method + Endpoint">
                                    {data.incident.http_method && data.incident.endpoint
                                        ? <span className="font-mono text-indigo-600 dark:text-indigo-400">{data.incident.http_method} {data.incident.endpoint}</span>
                                        : "—"}
                                </Row>
                                <Row label="Request ID">{data.incident.request_id ?? "—"}</Row>
                                <Row label="Client IP">{data.incident.client_ip ?? "—"}</Row>
                                <Row label="Username">{data.incident.username ?? "—"}</Row>
                                <Row label="User Role">{data.incident.user_role ?? "—"}</Row>
                            </div>

                            <SectionTitle>Exception</SectionTitle>
                            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0e1729] shadow-sm divide-y divide-gray-100 dark:divide-gray-800">
                                <Row label="Type">{data.incident.exception_type ?? "—"}</Row>
                                <Row label="Suggested Investigation">{data.incident.suggested_investigation ?? "—"}</Row>
                                <Row label="Reported Cause">{data.incident.reported_cause ?? "—"}</Row>
                            </div>
                            {data.incident.stack_trace && (
                                <pre className="rounded-xl bg-gray-900 dark:bg-black text-rose-300 text-xs p-3 overflow-x-auto whitespace-pre-wrap break-words">
                                    {data.incident.stack_trace}
                                </pre>
                            )}
                        </div>

                        <div className="space-y-3">
                            <SectionTitle>Incident Metadata</SectionTitle>
                            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0e1729] shadow-sm divide-y divide-gray-100 dark:divide-gray-800">
                                <Row label="Incident ID">{data.incident.incident_id}</Row>
                                <Row label="Boot ID">{data.incident.boot_id ?? "—"}</Row>
                                <Row label="First Seen">{formatDateTime(data.incident.first_seen_at)}</Row>
                                <Row label="Last Seen">{formatDateTime(data.incident.last_seen_at)}</Row>
                                {data.incident.fingerprint && (
                                    <Row label="Fingerprint">
                                        <span className="font-mono text-xs break-all">{data.incident.fingerprint}</span>
                                    </Row>
                                )}
                            </div>

                            {data.restarts.length > 0 && (
                                <>
                                    <SectionTitle>Linked Restarts</SectionTitle>
                                    <div className="space-y-2">
                                        {data.restarts.map((r) => (
                                            <Link
                                                key={r.id}
                                                href={`/dashboard/admin/monitoring/restarts/${r.id}`}
                                                className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0e1729] hover:border-indigo-300 dark:hover:border-indigo-700 px-3 py-2 text-sm"
                                            >
                                                <span className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                                    <RotateCcw className="w-3.5 h-3.5 text-blue-500" /> Restart #{r.id}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">{formatDateTime(r.detected_at)}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </>
                            )}

                            {data.emails.length > 0 && (
                                <>
                                    <SectionTitle>Email Notifications</SectionTitle>
                                    <div className="space-y-2">
                                        {data.emails.map((e) => (
                                            <Link
                                                key={e.id}
                                                href={`/dashboard/admin/monitoring/emails/${e.id}`}
                                                className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0e1729] hover:border-indigo-300 dark:hover:border-indigo-700 px-3 py-2 text-sm"
                                            >
                                                <span className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                                    <Mail className="w-3.5 h-3.5 text-gray-400" /> Attempt {e.attempts}
                                                </span>
                                                <span className="flex items-center gap-2">
                                                    <EmailStatusBadge status={e.status} />
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">{formatDateTime(e.created_at)}</span>
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-4 px-3 py-2.5 text-sm">
            <span className="text-gray-500 dark:text-gray-400">{label}</span>
            <span className="text-gray-900 dark:text-gray-100 text-right">{children}</span>
        </div>
    );
}
