"use client";

import React from "react";

function cx(...classes: Array<string | false | undefined | null>) {
    return classes.filter(Boolean).join(" ");
}

export function KpiCard({
    label,
    value,
    hint,
    tone = "neutral",
}: {
    label: string;
    value: string;
    hint?: string;
    tone?: "neutral" | "good" | "bad";
}) {
    const toneClasses =
        tone === "good"
            ? "border-emerald-200/60 dark:border-emerald-900/60"
            : tone === "bad"
                ? "border-rose-200/60 dark:border-rose-900/60"
                : "border-zinc-200/70 dark:border-zinc-800";

    return (
        <div className={cx("rounded-2xl border bg-white p-4 shadow-sm dark:bg-zinc-900/40", toneClasses)}>
            <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{label}</div>
            <div className="mt-2 text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                {value}
            </div>
            {hint ? <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{hint}</div> : null}
        </div>
    );
}
