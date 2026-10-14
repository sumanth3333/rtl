"use client";

import { useEffect, useMemo, useState } from "react";
import { format, subMonths } from "date-fns";
import { useOwner } from "@/hooks/useOwner";
import { fetchGrowthAnalytics } from "@/services/owner/growthAnalyticsService";
import { StoreGoalStrategy } from "@/types/storeGoalStrategy";
import FocusSuggestionCard from "@/components/employee/FocusSuggestionCard";
import DailyGoalSummary from "@/components/employee/DailyGoalSummary";
import PhaseCalendar from "@/components/employee/PhaseCalendar";

const MONTH_OPTIONS = Array.from({ length: 12 }).map((_, i) => {
    const date = subMonths(new Date(), i);
    return { value: format(date, "yyyy-MM"), label: format(date, "MMMM yyyy") };
});

export default function GrowthAnalyticsPage() {
    const { companyName } = useOwner();

    const [stores, setStores] = useState<StoreGoalStrategy[]>([]);
    const [selectedStoreId, setSelectedStoreId] = useState("");
    const [selectedMonth, setSelectedMonth] = useState(MONTH_OPTIONS[0].value);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!companyName) { return; }

        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchGrowthAnalytics(companyName, selectedMonth);
                setStores(data);
                setSelectedStoreId((prev) =>
                    data.some((s) => s.dealerStoreId === prev) ? prev : data[0]?.dealerStoreId || ""
                );
            } catch (err) {
                console.error("❌ Error fetching growth analytics:", err);
                setError("Failed to load growth analytics.");
                setStores([]);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [companyName, selectedMonth]);

    const sortedStores = useMemo(
        () => [...stores].sort((a, b) => a.dealerStoreId.localeCompare(b.dealerStoreId, undefined, { sensitivity: "base" })),
        [stores]
    );

    const selectedStore = useMemo(
        () => stores.find((s) => s.dealerStoreId === selectedStoreId) ?? null,
        [stores, selectedStoreId]
    );

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-4">
            <header className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gradient-to-r from-slate-50 via-white to-slate-100 dark:from-[#0a0f1c] dark:via-[#0d1324] dark:to-[#0a0f1c] p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-[11px] uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">Growth Analytics</p>
                        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                            Phase performance for {companyName || "your company"}
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Pick a store to see its sales phase strategy, today&apos;s goal, and day-by-day phase results.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Month selector */}
                        <div className="space-y-1 rounded-lg border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-gray-900 px-3 py-2 shadow-sm">
                            <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">Month</label>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                disabled={loading}
                                className="w-44 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                            >
                                {MONTH_OPTIONS.map((month) => (
                                    <option key={month.value} value={month.value}>
                                        {month.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Highlighted store selector */}
                        <div className="space-y-1 rounded-lg border-2 border-indigo-400 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-2 shadow-sm">
                            <label className="block text-xs font-bold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">Store</label>
                            <select
                                value={selectedStoreId}
                                onChange={(e) => setSelectedStoreId(e.target.value)}
                                disabled={loading || sortedStores.length === 0}
                                className="w-64 rounded-md border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                            >
                                <option value="">{loading ? "Loading stores..." : "Select store"}</option>
                                {sortedStores.map((store) => (
                                    <option key={store.dealerStoreId} value={store.dealerStoreId}>
                                        {store.dealerStoreId} — {store.storeName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </header>

            {error && (
                <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-700 dark:bg-rose-950/30 dark:text-rose-100">
                    {error}
                </div>
            )}

            {!loading && stores.length === 0 && !error && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                    No phase strategy data available yet.
                </p>
            )}

            {(loading || selectedStore) && (
                <>
                    <FocusSuggestionCard focusSuggestions={selectedStore?.focusSuggestions ?? []} loading={loading} />

                    <DailyGoalSummary dailyGoal={selectedStore?.todayGoal ?? null} />

                    <PhaseCalendar data={selectedStore} loading={loading} />
                </>
            )}
        </div>
    );
}
