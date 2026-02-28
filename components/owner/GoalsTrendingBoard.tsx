"use client";

import { useMemo, useState } from "react";
import type { GoalsTrendingCurrentlyItem } from "@/types/goalsTrending";

type Props = {
    rows: GoalsTrendingCurrentlyItem[];
    selectedMonth?: string;
};

type SortKey = "store" | "trending" | "achievedPct";
type SortDir = "asc" | "desc";

function daysLeftInSelectedMonth(selectedMonth?: string) {
    const now = new Date();

    let year = now.getFullYear();
    let monthIndex = now.getMonth();

    if (selectedMonth && /^\d{4}-\d{2}$/.test(selectedMonth)) {
        year = Number(selectedMonth.slice(0, 4));
        monthIndex = Number(selectedMonth.slice(5, 7)) - 1;
    }

    const lastDay = new Date(year, monthIndex + 1, 0).getDate();
    const isCurrentMonth = year === now.getFullYear() && monthIndex === now.getMonth();
    const todayDay = isCurrentMonth ? now.getDate() : 1;

    const remaining = lastDay - todayDay; // excluding today
    return Math.max(remaining, 0);
}

const fmtNumber = (n: number) =>
    new Intl.NumberFormat(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n);
const fmtTotals = (n: number) =>
    new Intl.NumberFormat(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n);

// Allow percentages to exceed 100% (backend can send >100 when surpassing goal)
function clampPct(n: number) {
    if (!Number.isFinite(n)) { return 0; }
    return Math.max(0, n);
}

function leftBadgeClasses(left: number, goal: number) {
    const ratio = goal > 0 ? left / goal : left > 0 ? 1 : 0;
    if (left <= 0) {
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-100 dark:border-emerald-800";
    }
    if (ratio <= 0.25) {
        return "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-100 dark:border-amber-800";
    }
    return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/40 dark:text-rose-100 dark:border-rose-800";
}

function trendBadgeClasses(perDay: number) {
    if (perDay <= 0) {
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-100 dark:border-emerald-800";
    }
    if (perDay <= 3) {
        return "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-100 dark:border-amber-800";
    }
    return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/40 dark:text-rose-100 dark:border-rose-800";
}

function progressChipClasses(pct: number) {
    if (pct >= 85) {
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-100 dark:border-emerald-800";
    }
    if (pct >= 50) {
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-100 dark:border-blue-800";
    }
    if (pct >= 25) {
        return "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-100 dark:border-amber-800";
    }
    return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/40 dark:text-rose-100 dark:border-rose-800";
}

export default function GoalsTrendingTable({ rows, selectedMonth }: Props) {
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDir }>({ key: "store", direction: "asc" });
    const daysLeft = useMemo(() => daysLeftInSelectedMonth(selectedMonth), [selectedMonth]);

    const computed = useMemo(() => {
        return rows.map((r) => {
            const leftFor125 = r.currentDifferenceForMaximumPerformanceGoal ?? 0;
            const perDay = daysLeft > 0 ? Math.ceil(leftFor125 / daysLeft) : leftFor125;

            const achievedPct = clampPct(r.totalGoalAcheivedPercentage ?? 0);

            return {
                ...r,
                _perDayFor125: perDay,
                _achievedPct: achievedPct,
            };
        });
    }, [rows, daysLeft]);

    const sorted = useMemo(() => {
        const list = [...computed];
        const { key, direction } = sortConfig;

        return list.sort((a, b) => {
            if (key === "store") {
                const result = a.store.dealerStoreId.localeCompare(b.store.dealerStoreId);
                return direction === "asc" ? result : -result;
            }

            if (key === "trending") {
                const result = a._perDayFor125 - b._perDayFor125;
                return direction === "asc" ? result : -result;
            }

            const result = (a._achievedPct ?? 0) - (b._achievedPct ?? 0);
            return direction === "asc" ? result : -result;
        });
    }, [computed, sortConfig]);

    const totals = useMemo(() => {
        const t = computed.reduce(
            (acc, r) => {
                acc.current += r.acheivedTillDate ?? 0;
                acc.goal100 += r.totalBoxes ?? 0;
                acc.left100 += r.currentDifference ?? 0;
                acc.goal125 += r.maximumPerformanceBonusGoal ?? 0;
                acc.left125 += r.currentDifferenceForMaximumPerformanceGoal ?? 0;
                return acc;
            },
            { current: 0, goal100: 0, left100: 0, goal125: 0, left125: 0 }
        );

        const trendTotal = daysLeft > 0 ? Math.ceil(t.left125 / daysLeft) : t.left125;

        return { ...t, trendTotal };
    }, [computed, daysLeft]);

    const toggleSort = (key: SortKey) => {
        setSortConfig((prev) =>
            prev.key === key
                ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
                : { key, direction: "asc" }
        );
    };

    const indicator = (key: SortKey) => {
        if (sortConfig.key !== key) { return ""; }
        return sortConfig.direction === "asc" ? "▲" : "▼";
    };

    return (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0b1220] shadow-sm overflow-hidden">
            {/* Header (compact) */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900 text-white text-sm">
                        🎯
                    </span>
                    <div className="leading-tight">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Goals Trending</p>
                        <p className="text-[11px] sm:text-[12px] text-zinc-500 dark:text-zinc-300">
                            Trending = boxes/day for{" "}
                            <span className="font-semibold text-indigo-700 dark:text-indigo-300">125%</span>
                            {" "}
                            • Days left:{" "}
                            <span className="font-semibold text-emerald-700 dark:text-emerald-300">{daysLeft}</span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm table-auto">

                    <thead className="sticky top-0 z-10 bg-zinc-50 dark:bg-zinc-900 text-[10px] sm:text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-700">
                        <tr>
                            <th
                                className="px-2 py-1.5 whitespace-nowrap cursor-pointer select-none"
                                onClick={() => toggleSort("store")}
                                title="Sort by store"
                            >
                                Store ID {indicator("store")}
                            </th>
                            <th
                                className="px-2 py-1.5 text-right whitespace-nowrap cursor-pointer select-none"
                                onClick={() => toggleSort("achievedPct")}
                                title="Sort by achieved percent"
                            >
                                Achieved % {indicator("achievedPct")}
                            </th>
                            <th className="px-2 py-1.5 text-right">Current</th>
                            <th className="px-2 py-1.5 text-right whitespace-nowrap">Goal to 100%</th>
                            <th className="px-2 py-1.5 text-right whitespace-nowrap">Left for 100%</th>
                            <th className="px-2 py-1.5 text-right whitespace-nowrap">Goal to 125%</th>
                            <th className="px-2 py-1.5 text-right whitespace-nowrap">Left for 125%</th>
                            <th
                                className="px-2 py-1.5 text-right whitespace-nowrap cursor-pointer select-none"
                                onClick={() => toggleSort("trending")}
                                title="Sort by trending per day"
                            >
                                Trending {indicator("trending")}
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {sorted.map((r) => {
                            const left100 = r.currentDifference ?? 0;
                            const goal100 = r.totalBoxes ?? 0;

                            const left125 = r.currentDifferenceForMaximumPerformanceGoal ?? 0;
                            const goal125 = r.maximumPerformanceBonusGoal ?? 0;

                            return (
                                <tr
                                    key={r.store.dealerStoreId}
                                    className="text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors"
                                >
                                    <td className="px-2 py-1">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
                                            <span className="truncate font-semibold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm">
                                                {r.store.dealerStoreId}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-2 py-1 text-right">
                                        <span
                                            className={`shrink-0 inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] sm:text-[11px] font-semibold whitespace-nowrap ${progressChipClasses(
                                                r._achievedPct
                                            )}`}
                                            title="Achieved % for 100% goal"
                                        >
                                            {r._achievedPct.toFixed(2)}%
                                        </span>
                                    </td>

                                    <td className="px-2 py-1 text-right font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                                        {fmtNumber(r.acheivedTillDate ?? 0)}
                                    </td>

                                    <td className="px-2 py-1 text-right text-zinc-700 dark:text-zinc-200 tabular-nums">
                                        {fmtNumber(goal100)}
                                    </td>

                                    <td className="px-2 py-1 text-right tabular-nums">
                                        <span
                                            className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] sm:text-[11px] font-semibold whitespace-nowrap ${leftBadgeClasses(
                                                left100,
                                                goal100
                                            )}`}
                                        >
                                            {left100 < 0 ? `+${fmtNumber(Math.abs(left100))}` : fmtNumber(left100)}
                                        </span>
                                    </td>

                                    <td className="px-2 py-1 text-right text-zinc-700 dark:text-zinc-200 tabular-nums">
                                        {fmtNumber(goal125)}
                                    </td>

                                    <td className="px-2 py-1 text-right tabular-nums">
                                        <span
                                            className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] sm:text-[11px] font-semibold whitespace-nowrap ${leftBadgeClasses(
                                                left125,
                                                goal125
                                            )}`}
                                        >
                                            {left125 < 0 ? `+${fmtNumber(Math.abs(left125))}` : fmtNumber(left125)}
                                        </span>
                                    </td>

                                    <td className="px-2 py-1 text-right tabular-nums">
                                        <span
                                            className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] sm:text-[11px] font-extrabold whitespace-nowrap ${trendBadgeClasses(
                                                r._perDayFor125
                                            )}`}
                                            title="Boxes per day needed to hit 125%"
                                        >
                                            {fmtNumber(r._perDayFor125)} /day
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}

                        {sorted.length === 0 && (
                            <tr>
                                <td className="px-2 py-3 text-center text-sm text-zinc-500" colSpan={8}>
                                    No goals data available.
                                </td>
                            </tr>
                        )}
                    </tbody>

                    {/* ✅ TOTALS FOOTER ROW */}
                    {computed.length > 0 && (
                        <tfoot className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-900">
                            <tr className="text-[12px] font-bold text-zinc-900 dark:text-zinc-100">
                                <td className="px-2 py-1.5">TOTAL</td>

                                <td className="px-2 py-1.5 text-right tabular-nums text-zinc-400 dark:text-zinc-500">
                                    —
                                </td>

                                <td className="px-2 py-1.5 text-right tabular-nums">
                                    {fmtTotals(totals.current)}
                                </td>

                                <td className="px-2 py-1.5 text-right tabular-nums">
                                    {fmtTotals(totals.goal100)}
                                </td>

                                <td className="px-2 py-1.5 text-right tabular-nums">
                                    {totals.left100 < 0 ? `+${fmtTotals(Math.abs(totals.left100))}` : fmtTotals(totals.left100)}
                                </td>

                                <td className="px-2 py-1.5 text-right tabular-nums">
                                    {fmtTotals(totals.goal125)}
                                </td>

                                <td className="px-2 py-1.5 text-right tabular-nums">
                                    {totals.left125 < 0 ? `+${fmtTotals(Math.abs(totals.left125))}` : fmtTotals(totals.left125)}
                                </td>

                                <td className="px-2 py-1.5 text-right tabular-nums">
                                    <span
                                        className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] sm:text-[11px] font-extrabold whitespace-nowrap ${trendBadgeClasses(
                                            totals.trendTotal
                                        )}`}
                                        title="Total boxes/day needed for 125%"
                                    >
                                        {fmtTotals(totals.trendTotal)} /day
                                    </span>
                                </td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </div>
    );
}
