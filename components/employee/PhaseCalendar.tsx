"use client";

import { useMemo, useState } from "react";
import { eachDayOfInterval, parseISO, format, getDay, isSameDay } from "date-fns";
import { RotateCcw } from "lucide-react";
import { PhaseHistoryEntry, PhaseMetricPerformance, StoreGoalStrategy } from "@/types/storeGoalStrategy";
import { iconForMetric } from "./metricIcons";

interface Props {
    data: StoreGoalStrategy | null;
    loading?: boolean;
}

type DailyMetricKey = "activations" | "bts" | "hsi" | "migrations" | "accessories";
type PerformanceMetricKey = "activations" | "accessories" | "bts" | "hsi" | "migrations";

const METRICS: { key: DailyMetricKey; letter: string; label: string; isCurrency?: boolean }[] = [
    { key: "activations", letter: "A", label: "Activations" },
    { key: "bts", letter: "B", label: "BTS" },
    { key: "hsi", letter: "H", label: "HSI" },
    { key: "migrations", letter: "M", label: "Migrations" },
    { key: "accessories", letter: "$", label: "Accessories", isCurrency: true },
];

const PERFORMANCE_METRICS: { key: PerformanceMetricKey; label: string; isCurrency?: boolean }[] = [
    { key: "activations", label: "Activations" },
    { key: "accessories", label: "Accessories", isCurrency: true },
    { key: "bts", label: "BTS" },
    { key: "hsi", label: "HSI" },
    { key: "migrations", label: "Migrations" },
];

const STATUS_ROW_CLASSES: Record<string, string> = {
    ACHIEVED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    PARTIAL: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    MISSED: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
    GREAT_WORK: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
    "NO TARGET": "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
};

const STATUS_LABELS: Record<string, string> = {
    ACHIEVED: "Achieved",
    PARTIAL: "Partial",
    MISSED: "Missed",
    GREAT_WORK: "No target — great work",
    "NO TARGET": "No target set",
};

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const formatStrategyName = (name: string) =>
    name
        .split("_")
        .filter(Boolean)
        .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
        .join(" ");

const formatMonthStatus = (status: string) =>
    status
        .split("_")
        .filter(Boolean)
        .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
        .join(" ");

const performanceTierClass = (pct: number) => {
    if (pct >= 100) { return { bar: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" }; }
    if (pct >= 70) { return { bar: "bg-blue-500", badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" }; }
    if (pct >= 40) { return { bar: "bg-amber-500", badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" }; }
    return { bar: "bg-rose-500", badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300" };
};

const money = (n: number) => `$${n.toFixed(2)}`;
const dayValue = (isCurrency: boolean | undefined, n: number) => (isCurrency ? `$${Math.round(n)}` : String(n));

export default function PhaseCalendar({ data, loading }: Props) {
    const sortedPhases = useMemo<PhaseHistoryEntry[]>(() => {
        if (!data) { return []; }
        return [...data.previousSprints].sort((a, b) => a.sprintNumber - b.sprintNumber);
    }, [data]);

    const [selectedPhase, setSelectedPhase] = useState<number | null>(null);

    const activePhaseNumber = selectedPhase ?? data?.sprintNumber ?? sortedPhases[sortedPhases.length - 1]?.sprintNumber ?? null;
    const activePhase = sortedPhases.find((p) => p.sprintNumber === activePhaseNumber) ?? sortedPhases[sortedPhases.length - 1] ?? null;

    if (loading) {
        return <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 p-6 animate-pulse h-64" />;
    }

    if (!data || !activePhase) {
        return null;
    }

    const days = eachDayOfInterval({ start: parseISO(activePhase.sprintStartDate), end: parseISO(activePhase.sprintEndDate) });
    const leadingBlanks = getDay(days[0]);
    const dayDataByDate = new Map(activePhase.days.map((d) => [d.date, d]));
    const today = data.todayGoal?.date ? parseISO(data.todayGoal.date) : null;
    const isCurrentPhase = activePhase.sprintNumber === data.sprintNumber;
    const hasCarryForward = Object.values(data.carryForwardGoal ?? {}).some((v) => Number(v) > 0);
    const previousPhaseNumber = data.sprintNumber - 1;
    // Carry-forward amounts are only final once the phase has actually ended (or today is its last day) —
    // showing them mid-phase would be misleading since they can still change before the phase closes.
    const isPhaseComplete = activePhase.sprintNumber < data.sprintNumber || (!!today && isSameDay(today, parseISO(activePhase.sprintEndDate)));

    return (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 lg:p-6 shadow-sm overflow-hidden">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">
                            {formatStrategyName(data.strategyName)} Strategy · {data.storeName}
                        </p>
                        {data.monthStatus && (
                            <span className="inline-flex items-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 px-2 py-0.5 text-[10px] font-semibold">
                                {formatMonthStatus(data.monthStatus)}
                            </span>
                        )}
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Phase {activePhase.sprintNumber} Calendar
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {format(parseISO(activePhase.sprintStartDate), "MMM d")} – {format(parseISO(activePhase.sprintEndDate), "MMM d, yyyy")}
                        {isCurrentPhase && ` · ${data.sprintPercentage}% of monthly goal`}
                    </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                    {sortedPhases.map((phase) => (
                        <button
                            key={phase.sprintNumber}
                            type="button"
                            onClick={() => setSelectedPhase(phase.sprintNumber)}
                            className={`rounded-full px-3 py-2 sm:py-1.5 text-xs font-semibold border transition ${phase.sprintNumber === activePhase.sprintNumber
                                ? "bg-indigo-600 border-indigo-600 text-white"
                                : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                }`}
                        >
                            Phase {phase.sprintNumber}
                            {phase.sprintNumber === data.sprintNumber && " (current)"}
                        </button>
                    ))}
                </div>
            </div>

            {isCurrentPhase && data.sprintTarget && (
                <div className="mt-4 flex flex-wrap gap-2">
                    <TargetChip label="Activations" value={data.sprintTarget.activations} />
                    <TargetChip label="Accessories" value={money(data.sprintTarget.accessories)} />
                    <TargetChip label="Upgrades" value={data.sprintTarget.upgrades} />
                    <TargetChip label="HSI" value={data.sprintTarget.hsi} />
                    <TargetChip label="BTS" value={data.sprintTarget.bts} />
                    <TargetChip label="Free Lines" value={data.sprintTarget.freeLines} />
                    <TargetChip label="Migrations" value={data.sprintTarget.migrations} />
                </div>
            )}

            {isCurrentPhase && hasCarryForward && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                        <RotateCcw className="w-3 h-3 shrink-0" />
                        Carried forward from Phase {previousPhaseNumber}:
                    </span>
                    {data.carryForwardGoal.activations > 0 && <TargetChip label="Activations" value={data.carryForwardGoal.activations} accent="amber" />}
                    {data.carryForwardGoal.accessories > 0 && <TargetChip label="Accessories" value={money(data.carryForwardGoal.accessories)} accent="amber" />}
                    {data.carryForwardGoal.hsi > 0 && <TargetChip label="HSI" value={data.carryForwardGoal.hsi} accent="amber" />}
                    {data.carryForwardGoal.bts > 0 && <TargetChip label="BTS" value={data.carryForwardGoal.bts} accent="amber" />}
                    {data.carryForwardGoal.migrations > 0 && <TargetChip label="Migrations" value={data.carryForwardGoal.migrations} accent="amber" />}
                </div>
            )}

            {activePhase.sprintPerformance && (
                <div className="mt-5">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Phase Performance</p>
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-2">
                        {PERFORMANCE_METRICS.map((metric) => {
                            const perf: PhaseMetricPerformance | undefined = activePhase.sprintPerformance?.[metric.key];
                            if (!perf) { return null; }
                            const pct = Math.max(0, Math.min(100, perf.achievementPercentage));
                            const tier = performanceTierClass(perf.achievementPercentage);
                            const fmt = (n: number) => (metric.isCurrency ? money(n) : String(n));
                            const Icon = iconForMetric(metric.key);
                            return (
                                <div key={metric.key} className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 p-2.5">
                                    <div className="flex items-center justify-between gap-1">
                                        <span className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
                                            <Icon className="w-3.5 h-3.5 shrink-0" />
                                            {metric.label}
                                        </span>
                                        <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${tier.badge}`}>
                                            {perf.achievementPercentage.toFixed(0)}%
                                        </span>
                                    </div>
                                    <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 mt-1">
                                        {fmt(perf.actual)} / {fmt(perf.target)}
                                    </p>
                                    <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mt-1.5">
                                        <div className={`h-full rounded-full ${tier.bar}`} style={{ width: `${pct}%` }} />
                                    </div>
                                    {isPhaseComplete && perf.carryForward > 0 && (
                                        <p className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 mt-1">
                                            <RotateCcw className="w-2.5 h-2.5 shrink-0" />
                                            {fmt(perf.carryForward)} carries forward to Phase {activePhase.sprintNumber + 1}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-7 gap-1 lg:gap-1.5 mt-5 text-center text-[9px] lg:text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                {WEEKDAY_LABELS.map((d) => <div key={d} className="truncate">{d}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-1 lg:gap-1.5 mt-1.5">
                {Array.from({ length: leadingBlanks }).map((_, i) => (
                    <div key={`blank-${i}`} />
                ))}
                {days.map((day) => {
                    const dateStr = format(day, "yyyy-MM-dd");
                    const dayData = dayDataByDate.get(dateStr);
                    const isToday = today ? isSameDay(day, today) : false;

                    return (
                        <div
                            key={dateStr}
                            className={`rounded-lg border p-1 lg:p-2 min-h-[112px] lg:min-h-[136px] flex flex-col overflow-hidden ${isToday
                                ? "border-indigo-500 ring-2 ring-indigo-400 bg-indigo-50 dark:bg-indigo-950/30"
                                : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40"
                                }`}
                        >
                            <span className={`text-[11px] lg:text-sm font-semibold shrink-0 ${isToday ? "text-indigo-700 dark:text-indigo-300" : "text-gray-500 dark:text-gray-400"}`}>
                                {format(day, "d")}
                            </span>

                            {dayData ? (
                                <div className="mt-1 space-y-0.5 min-w-0">
                                    {METRICS.map((metric) => {
                                        const result = dayData[metric.key];
                                        const rowClass = STATUS_ROW_CLASSES[result.status] ?? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
                                        const statusLabel = STATUS_LABELS[result.status] ?? result.status;
                                        return (
                                            <div
                                                key={metric.key}
                                                title={`${metric.label}: ${statusLabel}`}
                                                className={`flex items-center gap-0.5 rounded px-0.5 lg:px-1 py-0.5 text-[8px] lg:text-[10px] font-bold leading-none ${rowClass}`}
                                            >
                                                <span className="shrink-0">{metric.letter}</span>
                                                <span className="truncate min-w-0 flex-1 text-right">
                                                    {dayValue(metric.isCurrency, result.actual)}/{dayValue(metric.isCurrency, result.target)}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-[9px] text-gray-300 dark:text-gray-600">
                                    {isToday ? "Today" : "Upcoming"}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                <LegendDot colorClass="bg-emerald-500" label="Achieved" />
                <LegendDot colorClass="bg-amber-500" label="Partial" />
                <LegendDot colorClass="bg-rose-500" label="Missed" />
                <LegendDot colorClass="bg-sky-500" label="No target" />
                <span className="text-gray-400 dark:text-gray-500">A = Activations · B = BTS · H = HSI · M = Migrations · $ = Accessories</span>
            </div>
        </div>
    );
}

function TargetChip({ label, value, accent }: { label: string; value: string | number; accent?: "amber" }) {
    const classes = accent === "amber"
        ? "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30"
        : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800";
    return (
        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs ${classes}`}>
            <span className="text-gray-500 dark:text-gray-400">{label}</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">{value}</span>
        </span>
    );
}

function LegendDot({ colorClass, label }: { colorClass: string; label: string }) {
    return (
        <span className="inline-flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${colorClass}`} />
            {label}
        </span>
    );
}
