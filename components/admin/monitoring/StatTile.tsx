"use client";

import { LucideIcon } from "lucide-react";

function cx(...classes: Array<string | false | undefined | null>) {
    return classes.filter(Boolean).join(" ");
}

export type StatTone = "neutral" | "critical" | "warning" | "good" | "info";

const toneClasses: Record<StatTone, { text: string; icon: string; ring: string }> = {
    neutral: {
        text: "text-gray-900 dark:text-gray-100",
        icon: "text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800",
        ring: "border-gray-200 dark:border-gray-800",
    },
    critical: {
        text: "text-rose-700 dark:text-rose-300",
        icon: "text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40",
        ring: "border-rose-200/70 dark:border-rose-900/50",
    },
    warning: {
        text: "text-amber-700 dark:text-amber-300",
        icon: "text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40",
        ring: "border-amber-200/70 dark:border-amber-900/50",
    },
    good: {
        text: "text-emerald-700 dark:text-emerald-300",
        icon: "text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40",
        ring: "border-emerald-200/70 dark:border-emerald-900/50",
    },
    info: {
        text: "text-blue-700 dark:text-blue-300",
        icon: "text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40",
        ring: "border-blue-200/70 dark:border-blue-900/50",
    },
};

export function StatTile({
    label,
    value,
    icon: Icon,
    tone = "neutral",
}: {
    label: string;
    value: string | number;
    icon?: LucideIcon;
    tone?: StatTone;
}) {
    const classes = toneClasses[tone];
    return (
        <div
            className={cx(
                "rounded-xl border bg-white dark:bg-[#0e1729] shadow-sm px-4 py-3.5 flex items-center gap-3",
                classes.ring
            )}
        >
            {Icon && (
                <div className={cx("shrink-0 rounded-lg p-2", classes.icon)}>
                    <Icon className="w-4 h-4" />
                </div>
            )}
            <div className="min-w-0">
                <p className={cx("text-xl sm:text-2xl font-bold tabular-nums leading-tight", classes.text)}>
                    {value}
                </p>
                <p className="text-[11px] sm:text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 truncate">
                    {label}
                </p>
            </div>
        </div>
    );
}
