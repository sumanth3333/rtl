"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { fetchEmailDetail } from "@/services/admin/monitoringService";
import { MonitoringEmailDetail } from "@/types/monitoringTypes";
import { ApiError } from "@/services/api/errorHandler";
import { EmailStatusBadge, PillTag } from "@/components/admin/monitoring/badges";

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

export default function EmailDetailPage() {
    const params = useParams();
    const id = Number(params?.id);

    const [data, setData] = useState<MonitoringEmailDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id || Number.isNaN(id)) { return; }
        let cancelled = false;
        setLoading(true);
        setError(null);
        fetchEmailDetail(id)
            .then((res) => { if (!cancelled) { setData(res); } })
            .catch((err) => { if (!cancelled) { setError(err instanceof ApiError ? err.message : "Failed to load email detail."); } })
            .finally(() => { if (!cancelled) { setLoading(false); } });
        return () => { cancelled = true; };
    }, [id]);

    return (
        <div className="p-3 md:p-6 space-y-4 max-w-3xl mx-auto">
            <Link href="/dashboard/admin/monitoring/emails" className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                <ArrowLeft className="w-4 h-4" /> Back to email outbox
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
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0e1729] shadow-sm p-4">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                            <EmailStatusBadge status={data.status} />
                            <PillTag>{data.incident_type}</PillTag>
                            <PillTag tone="info">{data.environment}</PillTag>
                        </div>
                        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{data.title}</h1>
                    </div>

                    {data.last_error && (
                        <div className="rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-950/20 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
                            ⚠ {data.last_error}
                        </div>
                    )}

                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0e1729] shadow-sm divide-y divide-gray-100 dark:divide-gray-800">
                        <Row label="Attempts">{data.attempts}</Row>
                        <Row label="Created At">{formatDateTime(data.created_at)}</Row>
                        <Row label="Claimed At">{formatDateTime(data.claimed_at)}</Row>
                        <Row label="Next Attempt At">{formatDateTime(data.next_attempt_at)}</Row>
                        <Row label="Sent At">{formatDateTime(data.sent_at)}</Row>
                    </div>

                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0e1729] shadow-sm divide-y divide-gray-100 dark:divide-gray-800">
                        <Row label="Incident">
                            <Link href={`/dashboard/admin/monitoring/incidents/${data.incident_id}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                                #{data.incident_id}
                            </Link>
                        </Row>
                        <Row label="Incident UUID">
                            <span className="font-mono text-xs break-all">{data.incident_uuid}</span>
                        </Row>
                        <Row label="First Seen">{formatDateTime(data.first_seen_at)}</Row>
                        <Row label="Last Seen">{formatDateTime(data.last_seen_at)}</Row>
                    </div>
                </>
            )}
        </div>
    );
}
