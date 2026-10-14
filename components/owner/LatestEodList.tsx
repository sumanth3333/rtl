"use client";

interface EodSummary {
    dealerStoreId: string;
    employeeName: string;
    boxesSold: string;
    upgrade: string;
    migrations: string;
    accessories: string;
    hsiSold: string;
    tabletsSold: string;
    watchesSold: string;
    saleDate: string;
}

interface LatestEodListProps {
    eodList: EodSummary[];
    totals?: {
        totalActivations: number;
        totalUpgrades: number;
        totalMigrations: number;
        totalHsi: number;
        totalBts: number;
        totalFreeLines: number;
        totalAccessories: number;
    };
    selectedDate: string;
    onDateChange: (date: string) => void;
    loading?: boolean;
}

import { useMemo, useState } from "react";
import SkeletonTable from "@/components/ui/skeletons/SkeletonTable";

type SortKey = "store" | "employee" | "accessories";
type SortDir = "asc" | "desc";

export default function LatestEodList({ eodList, totals, selectedDate, onDateChange, loading }: LatestEodListProps) {
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDir }>({ key: "store", direction: "asc" });

    const parseAccessories = (value: string) => {
        const num = Number.parseFloat(String(value).replace(/[^0-9.-]/g, ""));
        return Number.isFinite(num) ? num : 0;
    };

    const sortedEod = useMemo(() => {
        const list = [...eodList];
        const { key, direction } = sortConfig;

        return list.sort((a, b) => {
            if (key === "store") {
                const result = a.dealerStoreId.localeCompare(b.dealerStoreId);
                return direction === "asc" ? result : -result;
            }

            if (key === "employee") {
                const result = a.employeeName.localeCompare(b.employeeName);
                return direction === "asc" ? result : -result;
            }

            const result = parseAccessories(a.accessories) - parseAccessories(b.accessories);
            return direction === "asc" ? result : -result;
        });
    }, [eodList, sortConfig]);

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
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900 text-white text-sm">
                        📊
                    </span>
                    <div className="leading-tight">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">EOD Summary</p>
                        <p className="text-[11px] sm:text-[12px] text-zinc-500 dark:text-zinc-300">
                            {sortedEod.length} report{sortedEod.length === 1 ? "" : "s"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <label htmlFor="eod-date" className="text-zinc-500 dark:text-zinc-400">Date:</label>
                    <input
                        id="eod-date"
                        type="date"
                        value={selectedDate}
                        onChange={(e) => onDateChange(e.target.value)}
                        className="rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm"
                    />
                </div>
            </div>

            {loading ? (
                <div className="p-3">
                    <SkeletonTable rows={4} />
                </div>
            ) : sortedEod.length === 0 ? (
                <p className="text-zinc-500 dark:text-zinc-400 text-sm text-center py-6">No EOD reports available.</p>
            ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-center text-xs sm:text-sm table-fixed min-w-[760px]">
                    {/* Column widths as percentages so they rebalance with screen size; Employee gets the most room */}
                    <colgroup>
                        <col className="w-[9%]" />
                        <col className="w-[9%]" />
                        <col className="w-[19%]" />
                        <col className="w-[9%]" />
                        <col className="w-[9%]" />
                        <col className="w-[10%]" />
                        <col className="w-[8%]" />
                        <col className="w-[8%]" />
                        <col className="w-[9%]" />
                        <col className="w-[10%]" />
                    </colgroup>
                    <thead className="sticky top-0 z-10 bg-zinc-50 dark:bg-zinc-900 text-[10px] sm:text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-700">
                        <tr>
                            <th className="px-2 py-1.5 whitespace-nowrap">Date</th>
                            <th
                                className="px-2 py-1.5 whitespace-nowrap cursor-pointer select-none"
                                onClick={() => toggleSort("store")}
                                title="Sort by store"
                            >
                                Store {indicator("store")}
                            </th>
                            <th
                                className="px-2 py-1.5 whitespace-nowrap cursor-pointer select-none"
                                onClick={() => toggleSort("employee")}
                                title="Sort by employee"
                            >
                                Employee {indicator("employee")}
                            </th>
                            <th className="px-2 py-1.5 whitespace-nowrap">Activations</th>
                            <th className="px-2 py-1.5 whitespace-nowrap">Upgrades</th>
                            <th className="px-2 py-1.5 whitespace-nowrap">Migrations</th>
                            <th className="px-2 py-1.5 whitespace-nowrap">HSI</th>
                            <th className="px-2 py-1.5 whitespace-nowrap">BTS</th>
                            <th className="px-2 py-1.5 whitespace-nowrap">Free Lines</th>
                            <th
                                className="px-2 py-1.5 whitespace-nowrap cursor-pointer select-none"
                                onClick={() => toggleSort("accessories")}
                                title="Sort by accessories"
                            >
                                Accessories ($) {indicator("accessories")}
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {sortedEod.map((eod, index) => (
                            <tr
                                key={index}
                                className="text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors"
                            >
                                <td className="px-2 py-1.5 break-words text-zinc-500 dark:text-zinc-400">
                                    {eod.saleDate}
                                </td>
                                <td className="px-2 py-1.5 break-words font-semibold text-zinc-900 dark:text-zinc-100">
                                    {eod.dealerStoreId}
                                </td>
                                <td className="px-2 py-1.5 break-words text-zinc-700 dark:text-zinc-200">
                                    {eod.employeeName}
                                </td>
                                <td className="px-2 py-1.5 tabular-nums font-semibold text-blue-600 dark:text-blue-400">{eod.boxesSold}</td>
                                <td className="px-2 py-1.5 tabular-nums font-semibold text-blue-600 dark:text-blue-400">{eod.upgrade}</td>
                                <td className="px-2 py-1.5 tabular-nums font-semibold text-blue-600 dark:text-blue-400">{eod.migrations}</td>
                                <td className="px-2 py-1.5 tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">{eod.hsiSold}</td>
                                <td className="px-2 py-1.5 tabular-nums font-semibold text-indigo-600 dark:text-indigo-400">{eod.tabletsSold}</td>
                                <td className="px-2 py-1.5 tabular-nums font-semibold text-purple-600 dark:text-purple-400">{eod.watchesSold}</td>
                                <td className="px-2 py-1.5 tabular-nums font-semibold text-amber-600 dark:text-amber-400">${parseAccessories(eod.accessories).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>

                    {totals && sortedEod.length > 0 && (
                        <tfoot className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-900">
                            <tr className="text-[12px] font-bold text-zinc-900 dark:text-zinc-100">
                                <td className="px-2 py-1.5" colSpan={3}>TOTAL</td>
                                <td className="px-2 py-1.5 tabular-nums text-blue-700 dark:text-blue-300">{totals.totalActivations}</td>
                                <td className="px-2 py-1.5 tabular-nums text-blue-700 dark:text-blue-300">{totals.totalUpgrades}</td>
                                <td className="px-2 py-1.5 tabular-nums text-blue-700 dark:text-blue-300">{totals.totalMigrations}</td>
                                <td className="px-2 py-1.5 tabular-nums text-emerald-700 dark:text-emerald-300">{totals.totalHsi}</td>
                                <td className="px-2 py-1.5 tabular-nums text-indigo-700 dark:text-indigo-300">{totals.totalBts}</td>
                                <td className="px-2 py-1.5 tabular-nums text-purple-700 dark:text-purple-300">{totals.totalFreeLines}</td>
                                <td className="px-2 py-1.5 tabular-nums text-amber-700 dark:text-amber-300">
                                    ${totals.totalAccessories?.toFixed(2)}
                                </td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
            )}
        </div>
    );
}
