"use client";

import React from "react";

function cx(...classes: Array<string | false | undefined | null>) {
    return classes.filter(Boolean).join(" ");
}

export function Card({
    title,
    subtitle,
    right,
    children,
    className,
}: {
    title?: React.ReactNode;
    subtitle?: React.ReactNode;
    right?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cx(
                "rounded-2xl border border-zinc-200/70 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40",
                className
            )}
        >
            {(title || subtitle || right) && (
                <div className="flex items-start justify-between gap-3 border-b border-zinc-200/70 px-4 py-3 dark:border-zinc-800">
                    <div className="min-w-0">
                        {title && (
                            <div className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                {title}
                            </div>
                        )}
                        {subtitle && (
                            <div className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                                {subtitle}
                            </div>
                        )}
                    </div>
                    {right ? <div className="shrink-0">{right}</div> : null}
                </div>
            )}
            <div className="px-4 py-4">{children}</div>
        </div>
    );
}
