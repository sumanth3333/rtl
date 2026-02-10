"use client";

import React from "react";

function cx(...classes: Array<string | false | undefined | null>) {
    return classes.filter(Boolean).join(" ");
}

export function Row({
    label,
    value,
    strong,
}: {
    label: React.ReactNode;
    value: React.ReactNode;
    strong?: boolean;
}) {
    return (
        <div className="flex items-center justify-between gap-4 py-2">
            <div
                className={cx(
                    "text-sm",
                    strong
                        ? "font-semibold text-zinc-900 dark:text-zinc-100"
                        : "text-zinc-700 dark:text-zinc-300"
                )}
            >
                {label}
            </div>
            <div
                className={cx(
                    "text-sm tabular-nums",
                    strong
                        ? "font-semibold text-zinc-900 dark:text-zinc-100"
                        : "text-zinc-700 dark:text-zinc-300"
                )}
            >
                {value}
            </div>
        </div>
    );
}

export function Divider() {
    return <div className="my-2 h-px w-full bg-zinc-200/70 dark:bg-zinc-800" />;
}
