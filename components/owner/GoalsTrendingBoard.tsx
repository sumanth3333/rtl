"use client";

import { useMemo } from "react";
import type { GoalsTrendingCurrentlyItem } from "@/types/goalsTrending";

type Props = {
    rows: GoalsTrendingCurrentlyItem[];
    selectedMonth?: string;
};

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

const fmtInt = (n: number) => new Intl.NumberFormat().format(n);

function clampPct(n: number) {
    if (!Number.isFinite(n)) { return 0; }
    return Math.max(0, Math.min(100, n));
}

function leftBadgeClasses(left: number, goal: number) {
    const ratio = goal > 0 ? left / goal : left > 0 ? 1 : 0;
    if (left <= 0) { return "bg-emerald-50 text-emerald-700 border-emerald-200"; }
    if (ratio <= 0.25) { return "bg-amber-50 text-amber-800 border-amber-200"; }
    return "bg-rose-50 text-rose-700 border-rose-200";
}

function trendBadgeClasses(perDay: number) {
    if (perDay <= 0) { return "bg-emerald-50 text-emerald-700 border-emerald-200" };
    if (perDay <= 3) { return "bg-amber-50 text-amber-800 border-amber-200" };
    return "bg-rose-50 text-rose-700 border-rose-200";
}

function progressChipClasses(pct: number) {
    if (pct >= 85) { return "bg-emerald-50 text-emerald-700 border-emerald-200"; }
    if (pct >= 50) { return "bg-blue-50 text-blue-700 border-blue-200"; }
    if (pct >= 25) { return "bg-amber-50 text-amber-800 border-amber-200"; }
    return "bg-rose-50 text-rose-700 border-rose-200";
}

export default function GoalsTrendingTable({ rows, selectedMonth }: Props) {
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

    return (
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
            {/* Header (compact) */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900 text-white text-sm">
                        🎯
                    </span>
                    <div className="leading-tight">
                        <p className="text-sm font-semibold text-zinc-900">Goals Trending</p>
                        <p className="text-[12px] text-zinc-500">
                            Trending = boxes/day for <span className="font-semibold text-zinc-800">125%</span>
                            {" "}
                            • Days left: <span className="font-semibold text-zinc-700">{daysLeft}</span>
                        </p>
                    </div>
                </div>

                <span className="hidden md:inline-flex rounded-full border border-zinc-200 bg-zinc-50 px-2 py-1 text-[11px] font-semibold text-zinc-700">
                    Current month snapshot
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm table-fixed">
                    {/* tighter column distribution */}
                    <colgroup>
                        <col className="w-[28%]" />
                        <col className="w-[10%]" />
                        <col className="w-[12%]" />
                        <col className="w-[12%]" />
                        <col className="w-[12%]" />
                        <col className="w-[12%]" />
                        <col className="w-[14%]" />
                    </colgroup>

                    <thead className="sticky top-0 z-10 bg-zinc-50 text-[11px] uppercase tracking-wide text-zinc-500 border-b border-zinc-200">
                        <tr>
                            <th className="px-3 py-2">Store</th>
                            <th className="px-3 py-2 text-right">Current</th>
                            <th className="px-3 py-2 text-right">Goal 100</th>
                            <th className="px-3 py-2 text-right">Left 100</th>
                            <th className="px-3 py-2 text-right">Goal 125</th>
                            <th className="px-3 py-2 text-right">Left 125</th>
                            <th className="px-3 py-2 text-right">Trending</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-zinc-100">
                        {computed.map((r) => {
                            const left100 = r.currentDifference ?? 0;
                            const goal100 = r.totalBoxes ?? 0;

                            const left125 = r.currentDifferenceForMaximumPerformanceGoal ?? 0;
                            const goal125 = r.maximumPerformanceBonusGoal ?? 0;

                            return (
                                <tr
                                    key={r.store.dealerStoreId}
                                    className="text-zinc-800 hover:bg-zinc-50/60 transition-colors"
                                >
                                    <td className="px-3 py-2">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="truncate font-semibold text-zinc-900">
                                                    {r.store.storeName}
                                                </span>
                                                <span
                                                    className={`shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${progressChipClasses(
                                                        r._achievedPct
                                                    )}`}
                                                    title="Achieved % for 100% goal"
                                                >
                                                    {r._achievedPct.toFixed(0)}%
                                                </span>
                                            </div>
                                            <div className="text-[11px] text-zinc-500 truncate">{r.store.dealerStoreId}</div>
                                        </div>
                                    </td>

                                    <td className="px-3 py-2 text-right font-semibold text-zinc-900 tabular-nums">
                                        {fmtInt(r.acheivedTillDate ?? 0)}
                                    </td>

                                    <td className="px-3 py-2 text-right text-zinc-700 tabular-nums">
                                        {fmtInt(goal100)}
                                    </td>

                                    <td className="px-3 py-2 text-right tabular-nums">
                                        <span
                                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${leftBadgeClasses(
                                                left100,
                                                goal100
                                            )}`}
                                        >
                                            {fmtInt(left100)}
                                        </span>
                                    </td>

                                    <td className="px-3 py-2 text-right text-zinc-700 tabular-nums">
                                        {fmtInt(goal125)}
                                    </td>

                                    <td className="px-3 py-2 text-right tabular-nums">
                                        <span
                                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${leftBadgeClasses(
                                                left125,
                                                goal125
                                            )}`}
                                        >
                                            {fmtInt(left125)}
                                        </span>
                                    </td>

                                    <td className="px-3 py-2 text-right tabular-nums">
                                        <span
                                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-extrabold ${trendBadgeClasses(
                                                r._perDayFor125
                                            )}`}
                                            title="Boxes per day needed to hit 125%"
                                        >
                                            {fmtInt(r._perDayFor125)} /day
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}

                        {computed.length === 0 && (
                            <tr>
                                <td className="px-3 py-6 text-center text-sm text-zinc-500" colSpan={7}>
                                    No goals data available.
                                </td>
                            </tr>
                        )}
                    </tbody>

                    {/* ✅ TOTALS FOOTER ROW */}
                    {computed.length > 0 && (
                        <tfoot className="border-t border-zinc-200 bg-zinc-50/70">
                            <tr className="text-[12px] font-bold text-zinc-900">
                                <td className="px-3 py-2">TOTAL</td>

                                <td className="px-3 py-2 text-right tabular-nums">
                                    {fmtInt(totals.current)}
                                </td>

                                <td className="px-3 py-2 text-right tabular-nums">
                                    {fmtInt(totals.goal100)}
                                </td>

                                <td className="px-3 py-2 text-right tabular-nums">
                                    {fmtInt(totals.left100)}
                                </td>

                                <td className="px-3 py-2 text-right tabular-nums">
                                    {fmtInt(totals.goal125)}
                                </td>

                                <td className="px-3 py-2 text-right tabular-nums">
                                    {fmtInt(totals.left125)}
                                </td>

                                <td className="px-3 py-2 text-right tabular-nums">
                                    <span
                                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-extrabold ${trendBadgeClasses(
                                            totals.trendTotal
                                        )}`}
                                        title="Total boxes/day needed for 125%"
                                    >
                                        {fmtInt(totals.trendTotal)} /day
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
