"use client";

import { useMemo, useState } from "react";
import { StoreRebateReport } from "@/types/rebates";

type Props = {
    report: StoreRebateReport;
    currency: (value: number) => string;
    defaultPageSize?: number;
};

type Summary = StoreRebateReport["detailedReportSummary"];
type NumericSummaryKey = {
    [K in keyof Summary]: Summary[K] extends number ? K : never;
}[keyof Summary];

const metricsOrder: { label: string; key: NumericSummaryKey }[] = [
    { label: "Total Boxes", key: "totalBoxes" },
    { label: "Sold From Inventory", key: "boxesSoldFromInventory" },
    { label: "Purchasing Cost", key: "totalPurchasingCost" },
    { label: "Rebates Expected", key: "totalPendingRebates" }, // backend field: totalPendingRebates
    { label: "Rebates Received", key: "totalRebatesReceived" },
    { label: "Cash Collected", key: "totalCashCollectedInStoreWhileSellingFromInventory" },
    { label: "Rebate Difference", key: "totalRebateDifference" },
];

export default function StoreRebateCard({ report, currency, defaultPageSize = 10 }: Props) {
    const { store, detailedReportSummary: s } = report;
    const [open, setOpen] = useState(false);
    const [page, setPage] = useState(1);
    const pageSize = defaultPageSize;

    const totalPages = Math.max(1, Math.ceil(s.rebatesSummary.length / pageSize));
    const pageItems = useMemo(() => {
        const start = (page - 1) * pageSize;
        return s.rebatesSummary.slice(start, start + pageSize);
    }, [page, pageSize, s.rebatesSummary]);

    const changePage = (next: number) => {
        const bounded = Math.min(Math.max(1, next), totalPages);
        setPage(bounded);
    };

    return (
        <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-transparent to-emerald-500/10 pointer-events-none" />
                <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-4 gap-2">
                    <div>
                        <p className="text-xs uppercase tracking-[0.08em] text-gray-500 dark:text-gray-400">Store</p>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{store.storeName}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{store.dealerStoreId}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Badge label="Boxes" value={s.totalBoxes} />
                        <Badge label="Rebates" value={currency(s.totalRebatesReceived)} />
                        <Badge label="Expected" value={currency(s.totalPendingRebates)} tone="amber" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 px-4 pb-4">
                {metricsOrder.map((metric) => {
                    const value = s[metric.key];
                    const formatted = currency(value);
                    return (
                        <div key={metric.label} className="rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400">{metric.label}</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 break-words">
                                {!metric.label.includes("Boxes") && !metric.label.includes("Inventory") ? formatted : value}
                            </p>
                        </div>
                    );
                })}
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                    Device-level rebate records ({s.rebatesSummary.length})
                </div>
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-300 hover:text-indigo-700"
                >
                    {open ? "Hide details" : "Show details"}
                    <span className="text-xs">{open ? "▲" : "▼"}</span>
                </button>
            </div>

            {open && (
                <div className="px-4 pb-4 space-y-3">
                    {s.rebatesSummary.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-3">No device-level rebate records.</p>
                    ) : (
                        <>
                            <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-800">
                                <table className="min-w-full text-sm text-left">
                                    <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                        <tr>
                                            <th className="px-3 py-2 font-semibold">IMEI</th>
                                            <th className="px-3 py-2 font-semibold">Device</th>
                                            <th className="px-3 py-2 font-semibold">Purchasing Cost</th>
                                            <th className="px-3 py-2 font-semibold">Cash Collected</th>
                                            <th className="px-3 py-2 font-semibold">Rebates Expected</th>
                                            <th className="px-3 py-2 font-semibold">Received</th>
                                            <th className="px-3 py-2 font-semibold">Difference</th>
                                            <th className="px-3 py-2 font-semibold">Sold Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {pageItems.map((item) => (
                                            <tr key={item.imei} className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/70">
                                                <td className="px-3 py-2 font-mono text-xs">{item.imei}</td>
                                                <td className="px-3 py-2">{item.deviceName}</td>
                                                <td className="px-3 py-2">{currency(item.purchasingCost)}</td>
                                                <td className="px-3 py-2">{currency(item.cashCollectedInStore)}</td>
                                                <td className="px-3 py-2">{currency(item.rebatePending)}</td>
                                                <td className="px-3 py-2">{currency(item.rebateReceived)}</td>
                                                <td className="px-3 py-2">{currency(item.rebateDifference)}</td>
                                                <td className="px-3 py-2">{item.soldDate}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <PaginationControls
                                page={page}
                                totalPages={totalPages}
                                onPageChange={changePage}
                            />
                        </>
                    )}
                </div>
            )}
        </section>
    );
}

type BadgeProps = { label: string; value: string | number; tone?: "indigo" | "emerald" | "amber" };
function Badge({ label, value, tone = "indigo" }: BadgeProps) {
    const tones: Record<NonNullable<BadgeProps["tone"]>, string> = {
        indigo: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200 border-indigo-100 dark:border-indigo-800",
        emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200 border-emerald-100 dark:border-emerald-800",
        amber: "bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200 border-amber-100 dark:border-amber-800",
    };
    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold border ${tones[tone]}`}>
            <span>{label}</span>
            <span className="font-bold">{value}</span>
        </span>
    );
}

type PaginationProps = {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
};
function PaginationControls({ page, totalPages, onPageChange }: PaginationProps) {
    return (
        <div className="flex items-center justify-between text-sm">
            <div className="text-gray-600 dark:text-gray-300">
                Page {page} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => onPageChange(page - 1)}
                    disabled={page <= 1}
                    className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 disabled:opacity-50"
                >
                    Previous
                </button>
                <button
                    type="button"
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= totalPages}
                    className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
}
