"use client";

import { EmailStatus, IncidentSeverity } from "@/types/monitoringTypes";

function cx(...classes: Array<string | false | undefined | null>) {
    return classes.filter(Boolean).join(" ");
}

export function SeverityBadge({ severity }: { severity: IncidentSeverity | string }) {
    const isCritical = severity === "CRITICAL";
    return (
        <span
            className={cx(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide border",
                isCritical
                    ? "border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300"
                    : "border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300"
            )}
        >
            {severity}
        </span>
    );
}

export function EmailStatusBadge({ status }: { status: EmailStatus | string }) {
    const toneMap: Record<string, string> = {
        SENT: "border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300",
        FAILED: "border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300",
        PENDING: "border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300",
        RETRY: "border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300",
        PROCESSING: "border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300",
    };
    return (
        <span
            className={cx(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide border",
                toneMap[status] ?? "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
            )}
        >
            {status}
        </span>
    );
}

export function PillTag({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "info" }) {
    return (
        <span
            className={cx(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold border",
                tone === "info"
                    ? "border-indigo-200 dark:border-indigo-900/60 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300"
                    : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
            )}
        >
            {children}
        </span>
    );
}
