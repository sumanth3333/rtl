"use client";

export default function GoalPill({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div
            className="
        flex items-center justify-between gap-3
        rounded-xl border border-gray-200/70 dark:border-gray-800/70
        bg-white/70 dark:bg-gray-950/10
        px-3 py-2
      "
        >
            <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {label}
            </span>
            <span className="text-sm font-extrabold text-gray-900 dark:text-gray-100">
                {value}
            </span>
        </div>
    );
}