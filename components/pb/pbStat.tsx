"use client";

export default function pbStat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-gray-200/70 dark:border-gray-800/70 bg-gray-50/70 dark:bg-gray-900/30 px-3 py-2">
            <div className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</div>
            <div className="mt-1 text-sm font-extrabold text-gray-900 dark:text-gray-100">{value}</div>
        </div>
    );
}
