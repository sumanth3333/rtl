"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { ApiEndpointStats } from "@/types/monitoringTypes";

function cx(...classes: Array<string | false | undefined | null>) {
    return classes.filter(Boolean).join(" ");
}

const errorRateTone = (rate: number) => {
    if (rate >= 10) { return "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40"; }
    if (rate > 0) { return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40"; }
    return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40";
};

const statusTone = (status: number) => {
    if (status >= 500) { return "text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/50"; }
    if (status >= 400) { return "text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/50"; }
    return "text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800";
};

const formatErrorTime = (value: string) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) { return value; }
    return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });
};

function ApiRow({ api }: { api: ApiEndpointStats }) {
    const [open, setOpen] = useState(false);
    const hasErrors = api.errors > 0;
    const statusEntries = Object.entries(api.errorsByStatus ?? {});

    return (
        <div className="border-b border-gray-100 dark:border-gray-800 last:border-0">
            <button
                type="button"
                onClick={() => hasErrors && setOpen((v) => !v)}
                disabled={!hasErrors}
                className={cx(
                    "w-full flex items-center justify-between gap-2 py-2 text-left",
                    hasErrors ? "cursor-pointer" : "cursor-default"
                )}
            >
                <div className="flex items-center gap-1.5 min-w-0">
                    {hasErrors ? (
                        open ? (
                            <ChevronDown className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                        ) : (
                            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                        )
                    ) : (
                        <span className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span className="font-mono text-xs truncate">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{api.method}</span> {api.endpoint}
                    </span>
                </div>
                <div className="flex items-center gap-3 shrink-0 text-xs">
                    <span className="text-gray-500 dark:text-gray-400 hidden sm:inline">{api.requests} req</span>
                    <span className="text-gray-500 dark:text-gray-400 hidden sm:inline">{api.averageResponseTimeMs.toFixed(0)} ms</span>
                    <span className={cx("rounded px-1.5 py-0.5 font-semibold tabular-nums", errorRateTone(api.errorRate))}>
                        {hasErrors ? `${api.errors} err · ${api.errorRate.toFixed(1)}%` : "0 err"}
                    </span>
                </div>
            </button>

            {open && hasErrors && (
                <div className="pb-3 pl-5 space-y-2.5">
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400">
                        <span>{api.clientErrors} client (4xx)</span>
                        <span>{api.serverErrors} server (5xx)</span>
                        {statusEntries.map(([status, count]) => (
                            <span key={status} className={cx("rounded px-1.5 py-0.5 font-semibold", statusTone(Number(status)))}>
                                {status} × {count}
                            </span>
                        ))}
                    </div>

                    {api.recentErrors.length > 0 && (
                        <div className="space-y-1.5">
                            {api.recentErrors.map((err, i) => (
                                <div
                                    key={i}
                                    className="rounded-md border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 px-2.5 py-1.5 text-[11px] flex items-start gap-2"
                                >
                                    <span className={cx("shrink-0 rounded px-1.5 py-0.5 font-bold tabular-nums", statusTone(err.status))}>
                                        {err.status}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="font-mono text-gray-700 dark:text-gray-300 truncate">
                                            {err.exception}
                                            <span className="text-gray-400 dark:text-gray-500 font-sans"> · {formatErrorTime(err.timestamp)}</span>
                                        </p>
                                        <p className="text-gray-500 dark:text-gray-400 truncate">{err.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export function TopApisPanel({ apis }: { apis: ApiEndpointStats[] }) {
    return (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0e1729] shadow-sm p-4 space-y-1">
            <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Top APIs</h2>
                <p className="text-[11px] text-gray-400 dark:text-gray-500">Tap a row with errors to expand</p>
            </div>
            {apis.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No requests recorded yet.</p>
            ) : (
                <div>
                    {apis.map((api, i) => (
                        <ApiRow key={`${api.method}-${api.endpoint}-${i}`} api={api} />
                    ))}
                </div>
            )}
        </div>
    );
}
