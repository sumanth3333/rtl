"use client";

import { useState } from "react";
import { WeeklyRebateStoreSummary } from "@/types/rebates";

type Props = {
    summaries: WeeklyRebateStoreSummary[];
    currency: (value: number) => string;
};

const uniqueValues = (vals: string[]) => Array.from(new Set(vals.filter(Boolean)));
const sum = (vals: number[]) => vals.reduce((acc, val) => acc + val, 0);

export default function WeeklySummaryTable({ summaries, currency }: Props) {
    const [showDetails, setShowDetails] = useState(false);

    if (!summaries.length) {
        return null;
    }

    const weekRanges = uniqueValues(summaries.map((s) => `${s.weekStartDate} to ${s.weekEndDate}`));
    const tuesdayPosts = uniqueValues(summaries.map((s) => s.tuesdaySummary?.postDate || ""));
    const fridayPosts = uniqueValues(summaries.map((s) => s.fridaySummary?.postDate || ""));
    const tuesdayBatches = uniqueValues(
        summaries.map((s) => `${s.tuesdaySummary?.batchStartDate || "—"} to ${s.tuesdaySummary?.batchEndDate || "—"}`),
    );
    const fridayBatches = uniqueValues(
        summaries.map((s) => `${s.fridaySummary?.batchStartDate || "—"} to ${s.fridaySummary?.batchEndDate || "—"}`),
    );

    const sortedRows = [...summaries].sort((a, b) =>
        a.store.dealerStoreId.localeCompare(b.store.dealerStoreId, undefined, { sensitivity: "base" }),
    );
    const tuesdayTotalRebate = sum(summaries.map((s) => s.tuesdaySummary?.totalCost || 0));
    const tuesdayDeductions = sum(summaries.map((s) => s.tuesdaySummary?.dealerDeduction || 0));
    const tuesdayAfterDeductions = sum(summaries.map((s) => s.tuesdaySummary?.expectedRebates || 0));

    const fridayTotalRebate = sum(summaries.map((s) => s.fridaySummary?.totalCost || 0));
    const fridayDeductions = sum(summaries.map((s) => s.fridaySummary?.dealerDeduction || 0));
    const fridayAfterDeductions = sum(summaries.map((s) => s.fridaySummary?.expectedRebates || 0));

    return (
        <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
            <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-800 space-y-4">
                <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">Quick View</p>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Expected Credit Memo's this week</h2>
                    <p className="text-xs tracking-[0.06em] text-gray-500 dark:text-gray-400">The credit memos shown are expected, Any chargebacks in this period will be deducted from the totals.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-3">
                    <SummaryGroup
                        title="Tuesday Totals"
                        totalRebate={currency(tuesdayTotalRebate)}
                        deductions={currency(tuesdayDeductions)}
                        afterDeductions={currency(tuesdayAfterDeductions)}
                    />
                    <SummaryGroup
                        title="Friday Totals"
                        totalRebate={currency(fridayTotalRebate)}
                        deductions={currency(fridayDeductions)}
                        afterDeductions={currency(fridayAfterDeductions)}
                    />
                </div>

                <div className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
                    <p>
                        Tuesday rebates posted on{" "}
                        <span className="font-semibold">{tuesdayPosts.length === 1 ? tuesdayPosts[0] : "multiple dates"}</span>{" "}
                        for transactions happened between{" "}
                        <span className="font-semibold">{tuesdayBatches.length === 1 ? tuesdayBatches[0] : "multiple ranges"}</span>.
                    </p>
                    <p>
                        Friday rebates posted on{" "}
                        <span className="font-semibold">{fridayPosts.length === 1 ? fridayPosts[0] : "multiple dates"}</span>{" "}
                        for transactions happened between{" "}
                        <span className="font-semibold">{fridayBatches.length === 1 ? fridayBatches[0] : "multiple ranges"}</span>.
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        Week range: {weekRanges.length === 1 ? weekRanges[0] : "multiple ranges"}
                    </p>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300">
                        <tr>
                            <th className="px-3 py-2 text-left font-semibold">Store</th>
                            <th className="px-3 py-2 text-right font-semibold text-indigo-700 dark:text-indigo-300">Total Rebate</th>
                            <th className="px-3 py-2 text-right font-semibold text-rose-700 dark:text-rose-300">Deductions</th>
                            <th className="px-3 py-2 text-right font-semibold text-emerald-700 dark:text-emerald-300">After Deductions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {sortedRows.map((row) => {
                            const tue = row.tuesdaySummary;
                            const fri = row.fridaySummary;
                            const totalRebate = (tue?.totalCost || 0) + (fri?.totalCost || 0);
                            const totalDeductions = (tue?.dealerDeduction || 0) + (fri?.dealerDeduction || 0);
                            const afterDeductions = (tue?.expectedRebates || 0) + (fri?.expectedRebates || 0);
                            return (
                                <tr key={row.store.dealerStoreId} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 align-top">
                                    <td className="px-3 py-2">
                                        <div className="font-medium text-gray-900 dark:text-gray-100">{row.store.storeName}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">{row.store.dealerStoreId}</div>
                                        {showDetails && (
                                            <div className="mt-2 space-y-1 text-[11px] text-gray-600 dark:text-gray-300">
                                                <p>Tue: {currency(tue?.totalCost || 0)} | Deduction: {currency(tue?.dealerDeduction || 0)} | After: {currency(tue?.expectedRebates || 0)}</p>
                                                <p>Fri: {currency(fri?.totalCost || 0)} | Deduction: {currency(fri?.dealerDeduction || 0)} | After: {currency(fri?.expectedRebates || 0)}</p>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-3 py-2 text-right font-semibold text-indigo-700 dark:text-indigo-300">{currency(totalRebate)}</td>
                                    <td className="px-3 py-2 text-right font-semibold text-rose-700 dark:text-rose-300">{currency(totalDeductions)}</td>
                                    <td className="px-3 py-2 text-right font-semibold text-emerald-700 dark:text-emerald-300">{currency(afterDeductions)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                <button
                    type="button"
                    onClick={() => setShowDetails((prev) => !prev)}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-300 hover:text-indigo-700"
                >
                    {showDetails ? "Hide detailed Tue/Fri split" : "Show detailed Tue/Fri split"}
                </button>
            </div>
        </section>
    );
}

function SummaryGroup({
    title,
    totalRebate,
    deductions,
    afterDeductions,
}: {
    title: string;
    totalRebate: string;
    deductions: string;
    afterDeductions: string;
}) {
    return (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 p-3">
            <p className="text-[10px] uppercase tracking-[0.1em] text-gray-500 dark:text-gray-400">{title}</p>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="rounded-md border border-indigo-100 dark:border-indigo-900 bg-indigo-50/70 dark:bg-indigo-950/30 px-2 py-1">
                    <p className="text-[10px] uppercase tracking-[0.08em] text-indigo-700 dark:text-indigo-300">Total Rebate</p>
                    <p className="font-semibold text-indigo-800 dark:text-indigo-200">{totalRebate}</p>
                </div>
                <div className="rounded-md border border-rose-100 dark:border-rose-900 bg-rose-50/70 dark:bg-rose-950/30 px-2 py-1">
                    <p className="text-[10px] uppercase tracking-[0.08em] text-rose-700 dark:text-rose-300">Deductions</p>
                    <p className="font-semibold text-rose-800 dark:text-rose-200">{deductions}</p>
                </div>
                <div className="rounded-md border border-emerald-100 dark:border-emerald-900 bg-emerald-50/70 dark:bg-emerald-950/30 px-2 py-1">
                    <p className="text-[10px] uppercase tracking-[0.08em] text-emerald-700 dark:text-emerald-300">After Deductions</p>
                    <p className="font-semibold text-emerald-800 dark:text-emerald-200">{afterDeductions}</p>
                </div>
            </div>
        </div>
    );
}
