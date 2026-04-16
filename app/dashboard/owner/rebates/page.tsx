"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useOwner } from "@/hooks/useOwner";
import { fetchRebates, fetchWeeklyRebatesSummary } from "@/services/owner/rebatesService";
import { StoreRebateReport, WeeklyRebateStoreSummary } from "@/types/rebates";
import SummaryStatCard from "@/components/owner/rebates/SummaryStatCard";
import StoreRebateCard from "@/components/owner/rebates/StoreRebateCard";
import WeeklySummaryTable from "@/components/owner/rebates/WeeklySummaryTable";

const toSafeNumber = (value: unknown): number => {
    if (typeof value === "number") {
        return Number.isFinite(value) ? value : 0;
    }
    if (typeof value === "string") {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
};

const currency = (value: unknown) =>
    toSafeNumber(value).toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

const sumReducer = (items: StoreRebateReport[], field: keyof StoreRebateReport["detailedReportSummary"]) =>
    items.reduce((acc, item) => acc + toSafeNumber(item.detailedReportSummary[field]), 0);

export default function RebatesPage() {
    const { companyName } = useOwner();
    const today = useMemo(() => new Date(), []);

    const defaultStart = useMemo(() => {
        const d = new Date(today);
        d.setDate(1);
        return d.toISOString().slice(0, 10);
    }, [today]);

    const defaultEnd = useMemo(() => {
        const d = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return d.toISOString().slice(0, 10);
    }, [today]);

    const [startDate, setStartDate] = useState(defaultStart);
    const [endDate, setEndDate] = useState(defaultEnd);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [reports, setReports] = useState<StoreRebateReport[]>([]);
    const [weeklySummary, setWeeklySummary] = useState<WeeklyRebateStoreSummary[]>([]);

    const loadData = useCallback(async () => {
        if (!companyName || !startDate || !endDate) { return; }
        setLoading(true);
        setError(null);
        try {
            const [rebatesData, weeklyData] = await Promise.all([
                fetchRebates(companyName, startDate, endDate),
                fetchWeeklyRebatesSummary(companyName),
            ]);
            setReports(Array.isArray(rebatesData) ? rebatesData : []);
            setWeeklySummary(Array.isArray(weeklyData) ? weeklyData : []);
        } catch (err: any) {
            setError(err?.message || "Failed to load rebates.");
            setReports([]);
            setWeeklySummary([]);
        } finally {
            setLoading(false);
        }
    }, [companyName, startDate, endDate]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const overall = useMemo(() => {
        if (!reports.length) { return null; }
        return {
            totalBoxes: sumReducer(reports, "totalBoxes"),
            boxesSoldFromInventory: sumReducer(reports, "boxesSoldFromInventory"),
            totalPurchasingCost: sumReducer(reports, "totalPurchasingCost"),
            totalPendingRebates: sumReducer(reports, "totalPendingRebates"),
            totalRebatesReceived: sumReducer(reports, "totalRebatesReceived"),
            totalCashCollectedInStoreWhileSellingFromInventory: sumReducer(reports, "totalCashCollectedInStoreWhileSellingFromInventory"),
            totalRebateDifference: sumReducer(reports, "totalRebateDifference"),
        };
    }, [reports]);

    return (
        <div className="p-4 md:p-6 space-y-5">
            <header className="relative overflow-hidden rounded-2xl border border-indigo-100/70 dark:border-indigo-900 bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 px-4 py-5 text-white shadow-sm">
                <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_top,_#ffffff22,_transparent_45%)]" />
                <div className="relative flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-white/70">Owner Portal</p>
                        <h1 className="text-2xl font-semibold">Rebates Overview</h1>
                        <p className="text-sm text-white/80">Track pending and received rebates by store and device.</p>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center bg-white/15 backdrop-blur-md px-3 py-2 rounded-lg border border-white/20">
                        <label className="text-xs font-semibold">
                            Start
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="ml-2 rounded-md border border-white/30 bg-white/90 text-gray-900 px-2 py-1 text-sm shadow-sm focus:outline-none"
                            />
                        </label>
                        <label className="text-xs font-semibold">
                            End
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="ml-2 rounded-md border border-white/30 bg-white/90 text-gray-900 px-2 py-1 text-sm shadow-sm focus:outline-none"
                            />
                        </label>
                        <button
                            type="button"
                            onClick={loadData}
                            disabled={loading}
                            className="px-3 py-2 text-sm font-semibold rounded-md bg-white text-indigo-700 hover:bg-slate-100 disabled:opacity-70"
                        >
                            {loading ? "Refreshing..." : "Refresh"}
                        </button>
                    </div>
                </div>
            </header>

            {error && (
                <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-700 dark:bg-rose-950/30 dark:text-rose-100">
                    {error}
                </div>
            )}

            <WeeklySummaryTable summaries={weeklySummary} currency={currency} />

            {overall && (
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <SummaryStatCard label="Total Boxes" value={overall.totalBoxes} accent="emerald" />
                    <SummaryStatCard label="Sold From Inventory" value={overall.boxesSoldFromInventory} accent="indigo" />
                    <SummaryStatCard label="Purchasing Cost" value={currency(overall.totalPurchasingCost)} accent="rose" />
                    <SummaryStatCard label="Rebates Expected" value={currency(overall.totalPendingRebates)} accent="amber" />
                    <SummaryStatCard label="Rebates Received" value={currency(overall.totalRebatesReceived)} accent="emerald" />
                    <SummaryStatCard label="Cash Collected" value={currency(overall.totalCashCollectedInStoreWhileSellingFromInventory)} accent="indigo" />
                    <SummaryStatCard label="Rebate Difference" value={currency(overall.totalRebateDifference)} accent="rose" />
                </section>
            )}

            <div className="space-y-4">
                {loading && <p className="text-sm text-gray-600 dark:text-gray-400">Loading rebates...</p>}
                {!loading && reports.length === 0 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">No rebate data for this range.</p>
                )}

                {!loading && reports.map((report) => (
                    <StoreRebateCard
                        key={report.store.dealerStoreId}
                        report={report}
                        currency={currency}
                        defaultPageSize={10}
                    />
                ))}
            </div>
        </div>
    );
}
