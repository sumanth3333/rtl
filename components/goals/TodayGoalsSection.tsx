"use client";

import { useEffect, useMemo, useState } from "react";
import type { TodayGoalRow } from "@/types/todayGoal";
import { goalService } from "@/services/goalService";
import TodayGoalsHeader from "@/components/goals/TodayGoalsHeader";
import TodayGoalsGrid from "@/components/goals/TodayGoalsGrid";

export default function TodayGoalsSection({ companyName }: { companyName: string }) {
    const [rows, setRows] = useState<TodayGoalRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function load() {
        setLoading(true);
        setError(null);
        try {
            const res = await goalService.todayGoal(companyName);
            const data = res.data ?? [];

            // Optional: put warehouse last automatically
            const sorted = [...data].sort((a, b) => {
                const aw = a.store.dealerStoreId.toLowerCase().includes("warehouse") ? 1 : 0;
                const bw = b.store.dealerStoreId.toLowerCase().includes("warehouse") ? 1 : 0;
                if (aw !== bw) { return aw - bw; }
                return a.store.storeName.localeCompare(b.store.storeName);
            });

            setRows(sorted);
        } catch (e: any) {
            setError(e?.response?.data?.message ?? "Failed to load today’s goals.");
            setRows([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [companyName]);

    const empty = useMemo(() => rows.length === 0, [rows]);

    return (
        <section className="space-y-4">
            <TodayGoalsHeader rows={rows} loading={loading} onRefresh={load} />

            {error && (
                <div className="rounded-xl border border-rose-200/70 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/30 px-4 py-3 text-sm text-rose-800 dark:text-rose-200">
                    {error}
                </div>
            )}

            {empty && !loading ? (
                <div className="rounded-2xl border border-gray-200/70 dark:border-gray-800/70 bg-white/70 dark:bg-gray-950/20 p-6 text-sm text-gray-600 dark:text-gray-400">
                    No goals found.
                </div>
            ) : (
                <TodayGoalsGrid rows={rows} />
            )}
        </section>
    );
}