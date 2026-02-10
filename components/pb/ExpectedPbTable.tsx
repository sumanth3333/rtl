"use client";

import { useMemo } from "react";
import type { ExpectedPBStore } from "@/types/pb";
import { money, pct, safeNum } from "@/lib/pbFormat";
import StatusPill from "@/components/pb/StatusPill";
import PbStat from "./pbStat";

export default function ExpectedPbTable({
    month,
    loading,
    rows,
    onRefresh,
}: {
    month: string;
    loading: boolean;
    rows: ExpectedPBStore[];
    onRefresh: () => void;
}) {
    const totals = useMemo(() => {
        const qualified = rows.filter((r) => String(r.eligibility?.isQualified).toLowerCase() === "qualified");
        return {
            stores: rows.length,
            qualified: qualified.length,
            totalBoxes: rows.reduce((a, r) => a + safeNum(r.totalBoxesSold), 0),
            totalPBNoRet: rows.reduce((a, r) => a + safeNum(r.acheivedPerformanceBonusWithoutRetention), 0),
            totalPBWithRet: rows.reduce((a, r) => a + safeNum(r.acheivedPerformanceBonusWithRetention), 0),
        };
    }, [rows]);

    return (
        <section
            className="
        rounded-2xl border border-gray-200/70 dark:border-gray-800/70
        bg-white/80 dark:bg-gray-950/40 backdrop-blur-xl
        shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)]
      "
        >
            <div className="p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">Expected Performance Bonus</h2>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Forecast per store for <span className="font-semibold">{month}</span>.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <PbStat label="Stores" value={String(totals.stores)} />
                        <PbStat label="Qualified" value={String(totals.qualified)} />
                        <PbStat label="Total Boxes" value={String(totals.totalBoxes)} />
                        <PbStat label="PB (No Ret.)" value={money(totals.totalPBNoRet)} />
                    </div>
                </div>

                <div className="mt-4 rounded-xl border border-gray-200/70 dark:border-gray-800/70 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-[980px] w-full text-sm">
                            <thead className="bg-gray-50/80 dark:bg-gray-900/40 text-gray-700 dark:text-gray-200">
                                <tr>
                                    <Th>Store</Th>
                                    <Th>Store ID</Th>
                                    <Th align="right">Boxes Sold</Th>
                                    <Th align="right">Goal (Min)</Th>
                                    <Th align="right">Goal (Max)</Th>
                                    <Th align="right">% Achieved</Th>
                                    <Th align="right">PB (No Ret.)</Th>
                                    <Th align="right">PB (With Ret.)</Th>
                                    <Th>Status</Th>
                                    <Th>Eligibility</Th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200/60 dark:divide-gray-800/60">
                                {loading ? (
                                    <tr>
                                        <td colSpan={10} className="px-4 py-8 text-center text-gray-600 dark:text-gray-400">
                                            Loading expected performance bonus...
                                        </td>
                                    </tr>
                                ) : rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="px-4 py-8 text-center text-gray-600 dark:text-gray-400">
                                            No data found for this month.
                                        </td>
                                    </tr>
                                ) : (
                                    rows.map((r) => {
                                        const qualified =
                                            String(r.eligibility?.isQualified).toLowerCase() === "qualified" &&
                                            safeNum(r.acheivedPerformanceBonusWithoutRetention) > 0;

                                        return (
                                            <tr key={r.store.dealerStoreId} className="bg-white/60 dark:bg-gray-950/10">
                                                <Td>
                                                    <div className="font-semibold text-gray-900 dark:text-gray-100">{r.store.storeName}</div>
                                                </Td>
                                                <Td className="font-mono text-xs text-gray-700 dark:text-gray-300">{r.store.dealerStoreId}</Td>
                                                <Td align="right">{r.totalBoxesSold}</Td>
                                                <Td align="right">{r.totalBoxesGoalMinimumPerformanceBonus}</Td>
                                                <Td align="right">{r.totalBoxesGoalMaximumPerformanceBonus}</Td>
                                                <Td align="right">{pct(r.percentageAcheived)}</Td>
                                                <Td align="right" className="font-semibold">{money(r.acheivedPerformanceBonusWithoutRetention)}</Td>
                                                <Td align="right" className="font-semibold">{money(r.acheivedPerformanceBonusWithRetention)}</Td>
                                                <Td>
                                                    <StatusPill qualified={qualified} />
                                                </Td>
                                                <Td>
                                                    <div className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
                                                        <div>{r.eligibility?.isMinimumNetActivationAcheived}</div>
                                                        <div>{r.eligibility?.isMinimumPercentageAcheived}</div>
                                                    </div>
                                                </Td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        Total PB (With Retention):{" "}
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{money(totals.totalPBWithRet)}</span>
                    </div>

                    <button
                        onClick={onRefresh}
                        disabled={loading}
                        className="
              inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold
              border border-gray-200/70 dark:border-gray-800/70
              bg-white/70 dark:bg-gray-900/40 text-gray-800 dark:text-gray-100
              hover:bg-white dark:hover:bg-gray-900
              disabled:opacity-60 disabled:cursor-not-allowed
            "
                    >
                        {loading ? "Refreshing..." : "Refresh"}
                    </button>
                </div>
            </div>
        </section>
    );
}

function Th({ children, align }: { children: React.ReactNode; align?: "left" | "right" | "center" }) {
    return (
        <th
            className={[
                "px-4 py-3 text-xs font-bold uppercase tracking-wide whitespace-nowrap",
                align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left",
            ].join(" ")}
        >
            {children}
        </th>
    );
}

function Td({
    children,
    align,
    className = "",
}: {
    children: React.ReactNode;
    align?: "left" | "right" | "center";
    className?: string;
}) {
    return (
        <td
            className={[
                "px-4 py-3 whitespace-nowrap text-gray-800 dark:text-gray-100",
                align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left",
                className,
            ].join(" ")}
        >
            {children}
        </td>
    );
}

