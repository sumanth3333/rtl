"use client";

interface SummaryStatCardProps {
    label: string;
    value: string | number;
    accent?: "indigo" | "emerald" | "amber" | "rose";
}

const accentClasses: Record<NonNullable<SummaryStatCardProps["accent"]>, string> = {
    indigo: "border-indigo-100 bg-indigo-50 text-indigo-900 dark:border-indigo-800/80 dark:bg-indigo-900/30 dark:text-indigo-100",
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-900 dark:border-emerald-800/80 dark:bg-emerald-900/30 dark:text-emerald-100",
    amber: "border-amber-100 bg-amber-50 text-amber-900 dark:border-amber-800/80 dark:bg-amber-900/30 dark:text-amber-100",
    rose: "border-rose-100 bg-rose-50 text-rose-900 dark:border-rose-800/80 dark:bg-rose-900/30 dark:text-rose-100",
};

export default function SummaryStatCard({ label, value, accent = "indigo" }: SummaryStatCardProps) {
    const colorClass = accentClasses[accent];
    return (
        <div className={`rounded-xl border shadow-sm px-3 py-3 sm:px-4 sm:py-4 ${colorClass}`}>
            <p className="text-xs uppercase tracking-[0.08em] opacity-80">{label}</p>
            <p className="text-lg sm:text-xl font-semibold mt-1 break-words">{value}</p>
        </div>
    );
}
