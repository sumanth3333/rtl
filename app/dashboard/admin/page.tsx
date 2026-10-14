"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    AlertTriangle,
    ArrowRight,
    Mail,
    MailWarning,
    MailCheck,
    RotateCcw,
    ShieldAlert,
    SquareArrowOutUpRight,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { fetchMonitoringDashboard } from "@/services/admin/monitoringService";
import { MonitoringDashboard } from "@/types/monitoringTypes";
import { ApiError } from "@/services/api/errorHandler";
import { StatTile } from "@/components/admin/monitoring/StatTile";
import { SeverityBadge, PillTag } from "@/components/admin/monitoring/badges";
import { EmailDeliveryChart, IncidentsByTypeChart, SeverityDonutChart } from "@/components/admin/monitoring/MonitoringCharts";

type Preset = "7d" | "30d";

const toISODate = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().split("T")[0];

const rangeFor = (preset: Preset) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - (preset === "30d" ? 29 : 6));
    return { startDate: toISODate(start), endDate: toISODate(end) };
};

const formatDisplayDate = (value: string) => {
    if (!value) { return "—"; }
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const formatDateTime = (value: string) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) { return { date: value, time: "" }; }
    return {
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    };
};

const shortUuid = (uuid: string) => (uuid.length > 16 ? `${uuid.slice(0, 8)}…${uuid.slice(-6)}` : uuid);

export default function AdminDashboard() {
    const { role, isLoading } = useAuth();
    const [preset, setPreset] = useState<Preset>("7d");
    const [dashboard, setDashboard] = useState<MonitoringDashboard | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const range = useMemo(() => rangeFor(preset), [preset]);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        fetchMonitoringDashboard(range)
            .then((data) => { if (!cancelled) { setDashboard(data); } })
            .catch((err) => { if (!cancelled) { setError(err instanceof ApiError ? err.message : "Failed to load the monitoring dashboard."); } })
            .finally(() => { if (!cancelled) { setLoading(false); } });
        return () => { cancelled = true; };
    }, [range]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-gray-500 text-lg">Loading dashboard...</p>
            </div>
        );
    }

    if (!role) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-gray-500 text-lg">Please log in to access the dashboard.</p>
            </div>
        );
    }

    const days = dashboard
        ? Math.round((new Date(dashboard.endDate).getTime() - new Date(dashboard.startDate).getTime()) / 86400000) + 1
        : 0;

    return (
        <div className="p-3 md:p-6 space-y-4">
            <header className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 dark:from-[#0a0f1c] dark:via-[#0c1320] dark:to-[#0a0f1c] px-4 py-4 shadow-sm">
                <div className="space-y-0.5">
                    <p className="text-xs uppercase tracking-[0.08em] text-gray-500 dark:text-gray-400">Admin Control Center</p>
                    <h1 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">Monitoring Summary</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {dashboard ? `${formatDisplayDate(dashboard.startDate)} – ${formatDisplayDate(dashboard.endDate)} · ${days} days` : "Loading period…"}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex rounded-md border border-gray-300 dark:border-gray-700 overflow-hidden text-xs font-medium">
                        {(["7d", "30d"] as Preset[]).map((p) => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => setPreset(p)}
                                className={`px-3 py-1.5 transition-colors ${preset === p
                                    ? "bg-indigo-600 text-white"
                                    : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                                    }`}
                            >
                                {p === "7d" ? "Last 7 days" : "Last 30 days"}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {error && (
                <div className="rounded-md bg-rose-100 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className="h-[72px] rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 animate-pulse" />
                    ))}
                </div>
            ) : dashboard && (
                <>
                    <section className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                        <StatTile label="Total Incidents" value={dashboard.totalIncidents} icon={AlertTriangle} tone="neutral" />
                        <StatTile label="Critical" value={dashboard.criticalIncidents} icon={ShieldAlert} tone="critical" />
                        <StatTile label="Errors" value={dashboard.errorIncidents} icon={AlertTriangle} tone="warning" />
                        <StatTile label="Restarts" value={dashboard.totalRestarts} icon={RotateCcw} tone="info" />
                        <StatTile label="Emails Sent" value={dashboard.sentEmails} icon={MailCheck} tone="good" />
                        <StatTile label="Pending Emails" value={dashboard.pendingEmails} icon={Mail} tone="warning" />
                        <StatTile label="Failed Emails" value={dashboard.failedEmails} icon={MailWarning} tone="critical" />
                    </section>

                    <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <IncidentsByTypeChart data={dashboard.incidentsByType} />
                        <SeverityDonutChart data={dashboard.incidentsBySeverity} />
                        <EmailDeliveryChart sent={dashboard.sentEmails} pending={dashboard.pendingEmails} failed={dashboard.failedEmails} />
                    </section>

                    <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <Panel title="Recent Incidents" viewAllHref="/dashboard/admin/monitoring/incidents">
                            {dashboard.recentIncidents.length === 0 ? (
                                <EmptyPanel text="No incidents in this period." />
                            ) : (
                                dashboard.recentIncidents.map((incident) => {
                                    const first = formatDateTime(incident.first_seen_at);
                                    const last = formatDateTime(incident.last_seen_at);
                                    return (
                                        <Link
                                            key={incident.id}
                                            href={`/dashboard/admin/monitoring/incidents/${incident.id}`}
                                            className="block rounded-lg border border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-colors p-3"
                                        >
                                            <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                                <SeverityBadge severity={incident.severity} />
                                                <PillTag>{incident.incident_type}</PillTag>
                                                <PillTag tone="info">{incident.environment}</PillTag>
                                            </div>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{incident.title}</p>
                                            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                                                <span>Occurrences: <span className="font-medium text-gray-700 dark:text-gray-300">{incident.occurrence_count}</span></span>
                                                <span>First: <span className="font-medium text-gray-700 dark:text-gray-300">{first.time}</span></span>
                                                <span>Last: <span className="font-medium text-gray-700 dark:text-gray-300">{last.time}</span></span>
                                                <span className="text-gray-400 dark:text-gray-500">{shortUuid(incident.incident_id)} · {last.date}</span>
                                            </div>
                                        </Link>
                                    );
                                })
                            )}
                        </Panel>

                        <Panel title="Recent Restarts" viewAllHref="/dashboard/admin/monitoring/restarts">
                            {dashboard.recentRestarts.length === 0 ? (
                                <EmptyPanel text="No server restarts in this period." />
                            ) : (
                                dashboard.recentRestarts.map((restart) => {
                                    const detected = formatDateTime(restart.detected_at);
                                    return (
                                        <Link
                                            key={restart.id}
                                            href={`/dashboard/admin/monitoring/restarts/${restart.id}`}
                                            className="block rounded-lg border border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-colors p-3"
                                        >
                                            <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                                <code className="text-xs rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-gray-700 dark:text-gray-300">{restart.previous_boot_id}</code>
                                                <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                                                <code className="text-xs rounded bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 text-indigo-700 dark:text-indigo-300">{restart.current_boot_id}</code>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                                                <span>Detected: <span className="font-medium text-gray-700 dark:text-gray-300">{detected.date} · {detected.time}</span></span>
                                                {restart.previous_state && (
                                                    <span>Previous state: <span className="font-medium text-gray-700 dark:text-gray-300">{restart.previous_state}</span></span>
                                                )}
                                                <span>Active count: <span className="font-medium text-gray-700 dark:text-gray-300">{restart.last_known_active_count}</span></span>
                                            </div>
                                            {restart.diagnosis && (
                                                <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">⚠ {restart.diagnosis}</p>
                                            )}
                                        </Link>
                                    );
                                })
                            )}
                        </Panel>
                    </section>
                </>
            )}
        </div>
    );
}

function Panel({ title, viewAllHref, children }: { title: string; viewAllHref: string; children: React.ReactNode }) {
    return (
        <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0e1729] shadow-sm p-4 space-y-2">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
                <Link
                    href={viewAllHref}
                    className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                >
                    View all <SquareArrowOutUpRight className="w-3 h-3" />
                </Link>
            </div>
            <div className="space-y-2">{children}</div>
        </section>
    );
}

function EmptyPanel({ text }: { text: string }) {
    return <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">{text}</p>;
}
