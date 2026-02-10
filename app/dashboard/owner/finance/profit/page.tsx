"use client";

import { useEffect, useMemo, useState } from "react";
import { useOwner } from "@/hooks/useOwner";
import apiClient from "@/services/api/apiClient";
import { format } from "date-fns";

import PAndENavBar from "@/components/owner/finance/PAndENavBar";
import { RevenueSection } from "@/components/owner/finance/RevenueSection";
import { ExpensesSection } from "@/components/owner/finance/ExpensesSection";
import { ProfitSection } from "@/components/owner/finance/ProfitSection";
import { ProfitByStoresSection } from "@/components/owner/finance/ProfitByStoresSection";
import { ProfitLookupSkeleton } from "@/components/owner/finance/ProfitLookupSkeleton";

import type { ProfitLookupResponse } from "@/types/finance";
import { safeNumber, money } from "@/lib/format";
import { KpiCard } from "@/components/ui/finance/KpiCard";

export default function ProfitLookupPage() {
    const { companyName } = useOwner();
    const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), "yyyy-MM"));
    const [data, setData] = useState<ProfitLookupResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const totals = useMemo(() => {
        const revenue = safeNumber(data?.revenue?.totalRevenue);
        const expenses = safeNumber(data?.expenses?.totalExpenses);
        const profit = safeNumber(data?.profit?.profit);
        const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
        return { revenue, expenses, profit, margin };
    }, [data]);

    useEffect(() => {
        if (!companyName) { return; }

        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await apiClient.get<ProfitLookupResponse>("/company/profitLookup", {
                    params: { companyName, month: selectedMonth },
                });
                setData(res.data);
            } catch (err: any) {
                setData(null);
                setError(err?.response?.data?.message || "Failed to load profit lookup.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [companyName, selectedMonth]);

    return (
        <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
                <PAndENavBar selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />

                {/* ✅ Top KPI strip */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <KpiCard label="Total Revenue" value={money(totals.revenue)} />
                    <KpiCard label="Total Expenses" value={money(totals.expenses)} />
                    <KpiCard
                        label="Profit"
                        value={money(totals.profit)}
                        hint={`Margin: ${totals.margin.toFixed(2)}%`}
                        tone={totals.profit >= 0 ? "good" : "bad"}
                    />
                </div>

                {error && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200">
                        <div className="font-semibold">Error</div>
                        <div className="mt-1 text-sm">{error}</div>
                    </div>
                )}

                {loading && <ProfitLookupSkeleton />}

                {!loading && data && (
                    <div className="grid gap-6 lg:grid-cols-12">
                        <div className="lg:col-span-4">
                            <RevenueSection revenue={data.revenue} />
                        </div>

                        <div className="lg:col-span-4">
                            <ExpensesSection expenses={data.expenses} />
                        </div>

                        <div className="lg:col-span-4">
                            <ProfitSection
                                profit={data.profit}
                                revenueTotal={data.revenue.totalRevenue}
                                expensesTotal={data.expenses.totalExpenses}
                            />
                        </div>

                        <div className="lg:col-span-12">
                            <ProfitByStoresSection profitByStores={data.profitByStores} />
                        </div>
                    </div>
                )}


                {!loading && !data && !error && (
                    <div className="rounded-2xl border border-zinc-200/70 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-300">
                        Select a month to view profit data.
                    </div>
                )}
            </div>
        </div>
    );
}
