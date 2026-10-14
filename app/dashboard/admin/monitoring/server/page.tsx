"use client";

import { useCallback, useEffect, useState } from "react";
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    Database,
    Loader2,
    Power,
    RefreshCw,
    Server,
    Users,
    X,
    XCircle,
} from "lucide-react";

import {
    fetchRestartRequestStatus,
    fetchServerHealth,
    triggerServerRestart,
} from "@/services/admin/monitoringService";
import { HealthStatus, RestartRequest, ServerHealthSnapshot } from "@/types/monitoringTypes";
import { ApiError } from "@/services/api/errorHandler";
import { StatTile } from "@/components/admin/monitoring/StatTile";
import { UsageBar } from "@/components/admin/monitoring/UsageBar";

const HEALTH_POLL_MS = 10_000;
const RESTART_POLL_MS = 2_000;
const RESTART_POLL_MAX_ATTEMPTS = 45; // ~90s

const DEFAULT_RESTART_REASON = "Scheduled application maintenance";

const bannerClassesForStatus = (status: HealthStatus) => {
    if (status === "CRITICAL") {
        return "border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300";
    }
    if (status === "WARNING") {
        return "border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300";
    }
    if (status === "HEALTHY") {
        return "border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300";
    }
    return "border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300";
};

const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const parts = [];
    if (d) { parts.push(`${d}d`); }
    if (h || d) { parts.push(`${h}h`); }
    parts.push(`${m}m`);
    return parts.join(" ");
};

const formatDateTime = (value: string) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) { return value; }
    return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
};

type RestartPhase = "idle" | "confirm" | "requesting" | "polling" | "done";

export default function ServerHealthPage() {
    const [health, setHealth] = useState<ServerHealthSnapshot | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [restartPhase, setRestartPhase] = useState<RestartPhase>("idle");
    const [reason, setReason] = useState(DEFAULT_RESTART_REASON);
    const [restartResult, setRestartResult] = useState<RestartRequest | null>(null);
    const [restartError, setRestartError] = useState<string | null>(null);

    const restartBusy = restartPhase === "requesting" || restartPhase === "polling";

    const loadHealth = useCallback((silent: boolean) => {
        if (!silent) { setLoading(true); }
        return fetchServerHealth()
            .then((data) => { setHealth(data); setError(null); })
            .catch((err) => {
                // During a restart the process briefly disappears - don't flash the error banner for that.
                if (!restartBusy) {
                    setError(err instanceof ApiError ? err.message : "Failed to load server health.");
                }
            })
            .finally(() => { if (!silent) { setLoading(false); } });
    }, [restartBusy]);

    useEffect(() => {
        loadHealth(false);
        const interval = setInterval(() => loadHealth(true), HEALTH_POLL_MS);
        return () => clearInterval(interval);
    }, [loadHealth]);

    const pollRestartStatus = useCallback((requestId: string, attempt: number) => {
        fetchRestartRequestStatus(requestId)
            .then((res) => {
                setRestartResult(res);
                if (res.status === "PENDING" && attempt < RESTART_POLL_MAX_ATTEMPTS) {
                    setTimeout(() => pollRestartStatus(requestId, attempt + 1), RESTART_POLL_MS);
                } else {
                    setRestartPhase("done");
                    loadHealth(true);
                }
            })
            .catch(() => {
                // Server is likely mid-restart and unreachable - keep polling until it comes back or we hit the cap.
                if (attempt < RESTART_POLL_MAX_ATTEMPTS) {
                    setTimeout(() => pollRestartStatus(requestId, attempt + 1), RESTART_POLL_MS);
                } else {
                    setRestartPhase("done");
                    loadHealth(true);
                }
            });
    }, [loadHealth]);

    const confirmRestart = () => {
        setRestartPhase("requesting");
        setRestartError(null);
        triggerServerRestart(reason.trim() || DEFAULT_RESTART_REASON)
            .then((res) => {
                setRestartResult(res);
                if (res.status === "PENDING") {
                    setRestartPhase("polling");
                    pollRestartStatus(res.requestId, 0);
                } else {
                    setRestartPhase("done");
                    loadHealth(true);
                }
            })
            .catch((err) => {
                setRestartError(err instanceof ApiError ? err.message : "Failed to request a server restart.");
                setRestartPhase("idle");
            });
    };

    const closeRestartPanel = () => {
        setRestartPhase("idle");
        setRestartResult(null);
        setRestartError(null);
        setReason(DEFAULT_RESTART_REASON);
    };

    if (loading) {
        return (
            <div className="p-3 md:p-6 space-y-4 max-w-6xl mx-auto">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-[72px] rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-3 md:p-6 space-y-4 max-w-6xl mx-auto">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Server Health</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        Live process, resource, and request status{health ? ` · updated ${formatDateTime(health.timestamp)}` : ""}.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setRestartPhase("confirm")}
                    disabled={restartBusy || !health?.restart.restartAvailable}
                    className="inline-flex items-center gap-1.5 rounded-md bg-rose-600 hover:bg-rose-700 disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:text-gray-500 text-white text-sm font-medium px-3.5 py-2 transition-colors"
                >
                    <Power className="w-4 h-4" />
                    Restart Server
                </button>
            </div>

            {error && (
                <div className="rounded-md bg-rose-100 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
                    {error}
                </div>
            )}

            {health && (
                <>
                    <div className={`rounded-xl border px-4 py-3.5 flex flex-wrap items-center justify-between gap-3 ${bannerClassesForStatus(health.overall.status)}`}>
                        <div className="flex items-center gap-3">
                            {health.overall.status === "HEALTHY" ? (
                                <CheckCircle2 className="w-5 h-5 shrink-0" />
                            ) : (
                                <AlertCircle className="w-5 h-5 shrink-0" />
                            )}
                            <div>
                                <p className="text-sm font-bold">{health.overall.status} · {health.overall.operationalState}</p>
                                <p className="text-xs opacity-90">{health.overall.summary}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-medium">
                            <span>Critical: {health.overall.criticalCount}</span>
                            <span>Warning: {health.overall.warningCount}</span>
                            <span>{health.environment} · {health.applicationName}</span>
                        </div>
                    </div>

                    <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <StatTile label="Uptime" value={formatUptime(health.server.uptimeSeconds)} icon={Clock} tone="info" />
                        <StatTile label="DB Response" value={`${health.database.responseTimeMs} ms`} icon={Database} tone={health.database.status === "UP" ? "good" : "critical"} />
                        <StatTile label="Active Requests" value={health.http.activeRequests} icon={Server} tone="neutral" />
                        <StatTile label="Active Users" value={health.userActivity.activeUsers} icon={Users} tone="neutral" />
                    </section>

                    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <UsageBar
                            label="CPU (system)"
                            percentage={health.cpu.systemPercentage}
                            detail={`${health.cpu.availableProcessors} cores · process ${health.cpu.processPercentage.toFixed(2)}%`}
                            status={health.cpu.status}
                        />
                        <UsageBar
                            label="Memory"
                            percentage={health.memory.usagePercentage}
                            detail={`${health.memory.usedMB} / ${health.memory.totalMB} MB`}
                            status={health.memory.status}
                        />
                        <UsageBar
                            label="Disk"
                            percentage={health.disk.usagePercentage}
                            detail={`${health.disk.freeGB} GB free of ${health.disk.totalGB} GB`}
                            status={health.disk.status}
                        />
                        <UsageBar
                            label="JVM Heap"
                            percentage={health.jvm.heapUsagePercentage}
                            detail={`${health.jvm.heapUsedMB} / ${health.jvm.heapMaxMB} MB · ${health.jvm.threadCount} threads`}
                            status={health.jvm.status}
                        />
                    </section>

                    <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0e1729] shadow-sm p-4 space-y-3">
                            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Top APIs</h2>
                            {health.http.topApis.length === 0 ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No requests recorded yet.</p>
                            ) : (
                                <div className="space-y-1.5">
                                    {health.http.topApis.map((api, i) => (
                                        <div key={i} className="flex items-center justify-between gap-2 text-xs border-b border-gray-100 dark:border-gray-800 pb-1.5 last:border-0 last:pb-0">
                                            <span className="font-mono truncate">
                                                <span className="font-bold text-indigo-600 dark:text-indigo-400">{api.method}</span> {api.endpoint}
                                            </span>
                                            <span className="text-gray-500 dark:text-gray-400 shrink-0">
                                                {api.requests} req · {api.averageResponseTimeMs.toFixed(0)} ms{api.errors > 0 ? ` · ${api.errors} err` : ""}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0e1729] shadow-sm p-4 space-y-3">
                            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Server & Activity</h2>
                            <dl className="grid grid-cols-2 gap-y-1.5 text-xs">
                                <dt className="text-gray-500 dark:text-gray-400">Host</dt>
                                <dd className="text-gray-900 dark:text-gray-100 text-right font-medium">{health.server.hostname} (pid {health.server.processId})</dd>
                                <dt className="text-gray-500 dark:text-gray-400">Java</dt>
                                <dd className="text-gray-900 dark:text-gray-100 text-right font-medium">{health.server.javaVersion} · {health.server.operatingSystem}</dd>
                                <dt className="text-gray-500 dark:text-gray-400">Started</dt>
                                <dd className="text-gray-900 dark:text-gray-100 text-right font-medium">{formatDateTime(health.server.startedAt)}</dd>
                                <dt className="text-gray-500 dark:text-gray-400">Admins / Owners / Managers / Employees</dt>
                                <dd className="text-gray-900 dark:text-gray-100 text-right font-medium">
                                    {health.userActivity.activeAdmins} / {health.userActivity.activeOwners} / {health.userActivity.activeManagers} / {health.userActivity.activeEmployees}
                                </dd>
                                <dt className="text-gray-500 dark:text-gray-400">Last restart status</dt>
                                <dd className="text-gray-900 dark:text-gray-100 text-right font-medium">{health.restart.lastRestartStatus}</dd>
                            </dl>
                        </div>
                    </section>

                    {health.issues.length > 0 && (
                        <section className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 p-4 space-y-2">
                            <h2 className="text-sm font-semibold text-amber-800 dark:text-amber-300">Detected Issues</h2>
                            {health.issues.map((issue, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span className="font-mono text-xs">{issue.code}</span>
                                    <span>{issue.message}</span>
                                </div>
                            ))}
                        </section>
                    )}
                </>
            )}

            {restartPhase !== "idle" && (
                <RestartModal
                    phase={restartPhase}
                    reason={reason}
                    onReasonChange={setReason}
                    result={restartResult}
                    error={restartError}
                    onConfirm={confirmRestart}
                    onClose={closeRestartPanel}
                />
            )}
        </div>
    );
}

function RestartModal({
    phase,
    reason,
    onReasonChange,
    result,
    error,
    onConfirm,
    onClose,
}: {
    phase: RestartPhase;
    reason: string;
    onReasonChange: (value: string) => void;
    result: RestartRequest | null;
    error: string | null;
    onConfirm: () => void;
    onClose: () => void;
}) {
    const canClose = phase === "confirm" || phase === "done";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={canClose ? onClose : undefined}
        >
            <div
                className="w-full max-w-md rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0e1729] shadow-xl p-5 space-y-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between gap-3">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <Power className="w-4.5 h-4.5 text-rose-600 dark:text-rose-400" />
                        Restart Server
                    </h3>
                    {canClose && (
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {phase === "confirm" && (
                    <>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            This restarts the live application process for every active user, admin, owner, manager, and employee alike. In-flight requests will be interrupted.
                        </p>
                        <label className="flex flex-col gap-1 text-xs">
                            <span className="font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Reason</span>
                            <textarea
                                value={reason}
                                onChange={(e) => onReasonChange(e.target.value)}
                                rows={2}
                                className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                            />
                        </label>
                        {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
                        <div className="flex justify-end gap-2 pt-1">
                            <button type="button" onClick={onClose} className="rounded-md px-3.5 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                                Cancel
                            </button>
                            <button type="button" onClick={onConfirm} className="rounded-md bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium px-3.5 py-2">
                                Confirm Restart
                            </button>
                        </div>
                    </>
                )}

                {(phase === "requesting" || phase === "polling") && (
                    <div className="flex items-center gap-3 py-3">
                        <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {phase === "requesting" ? "Sending restart request…" : `Waiting for restart to complete (request ${result?.requestId ?? "…"})…`}
                        </p>
                    </div>
                )}

                {phase === "done" && result && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            {result.status === "COMPLETED" ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            ) : result.status === "FAILED" ? (
                                <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                            ) : (
                                <RefreshCw className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            )}
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{result.status}</p>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{result.message}</p>
                        <div className="flex justify-end">
                            <button type="button" onClick={onClose} className="rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-3.5 py-2">
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
