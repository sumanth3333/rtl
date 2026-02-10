"use client";

export default function StatusPill({ qualified }: { qualified: boolean }) {
    return (
        <span
            className={[
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border",
                qualified
                    ? "border-emerald-200/70 dark:border-emerald-900/50 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200"
                    : "border-rose-200/70 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/30 text-rose-800 dark:text-rose-200",
            ].join(" ")}
        >
            {qualified ? "Qualified" : "Disqualified"}
        </span>
    );
}
