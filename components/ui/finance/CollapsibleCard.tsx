"use client";

import React from "react";

function cx(...classes: Array<string | false | undefined | null>) {
    return classes.filter(Boolean).join(" ");
}

export function CollapsibleCard({
    title,
    subtitle,
    right,
    defaultOpen = false,
    children,
    className,
}: {
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    right?: React.ReactNode;
    defaultOpen?: boolean;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <details
            className={cx(
                "group rounded-2xl border border-zinc-200/70 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40",
                className
            )}
            open={defaultOpen}
        >
            <summary className="cursor-pointer list-none select-none px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            {title}
                        </div>
                        {subtitle ? (
                            <div className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                                {subtitle}
                            </div>
                        ) : null}
                    </div>

                    <div className="flex items-center gap-3">
                        {right ? <div className="shrink-0">{right}</div> : null}

                        <div
                            className={cx(
                                "shrink-0 rounded-full border px-2 py-1 text-xs font-semibold",
                                "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-200"
                            )}
                        >
                            <span className="group-open:hidden">Expand</span>
                            <span className="hidden group-open:inline">Collapse</span>
                        </div>
                    </div>
                </div>
            </summary>

            <div className="border-t border-zinc-200/70 px-4 py-4 dark:border-zinc-800">
                {children}
            </div>
        </details>
    );
}
