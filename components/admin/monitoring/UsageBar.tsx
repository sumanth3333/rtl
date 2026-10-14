"use client";

import { HealthStatus } from "@/types/monitoringTypes";

function cx(...classes: Array<string | false | undefined | null>) {
    return classes.filter(Boolean).join(" ");
}

const barToneByStatus: Record<HealthStatus, string> = {
    HEALTHY: "bg-emerald-500",
    WARNING: "bg-amber-500",
    CRITICAL: "bg-rose-500",
    UNKNOWN: "bg-gray-400",
};

export function UsageBar({
    label,
    percentage,
    detail,
    status = "HEALTHY",
}: {
    label: string;
    percentage: number;
    detail?: string;
    status?: HealthStatus;
}) {
    const clamped = Math.min(100, Math.max(0, percentage));
    return (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0e1729] shadow-sm px-4 py-3.5 space-y-2">
            <div className="flex items-center justify-between gap-2">
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
                <p className="text-sm font-bold tabular-nums text-gray-900 dark:text-gray-100">{clamped.toFixed(1)}%</p>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div
                    className={cx("h-full rounded-full transition-all", barToneByStatus[status] ?? barToneByStatus.UNKNOWN)}
                    style={{ width: `${clamped}%` }}
                />
            </div>
            {detail && <p className="text-[11px] text-gray-500 dark:text-gray-400">{detail}</p>}
        </div>
    );
}
