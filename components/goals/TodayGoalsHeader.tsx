"use client";

import { useMemo } from "react";
import type { TodayGoalRow } from "@/types/todayGoal";
import { money, num } from "@/lib/format";

export default function TodayGoalsHeader({
    rows,
    loading,
    onRefresh,
}: {
    rows: TodayGoalRow[];
    loading: boolean;
    onRefresh: () => void;
}) {
    const totals = useMemo(() => {
        const sum = (k: keyof TodayGoalRow["todayGoal"]) =>
            rows.reduce((a, r) => a + Number(r.todayGoal?.[k] ?? 0), 0);

        return {
            activation: sum("activation"),
            accessories: sum("accessories"),
            tablet: sum("tablet"),
            hsi: sum("hsi"),
            upgrade: sum("upgrade"),
            migration: sum("migration"),
        };
    }, [rows]);

    return (
        <div
            className="
        relative overflow-hidden rounded-2xl
        border border-gray-200/70 dark:border-gray-800/70
        bg-white/80 dark:bg-gray-950/40 backdrop-blur-xl
        shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)]
      "
        >
            <div className="p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
                            Today’s Goal (All Stores)
                        </h2>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Aggregated target for the day across all stores.
                        </p>
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

                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                    <Stat label="Activations" value={num(totals.activation)} />
                    <Stat label="Accessories" value={money(totals.accessories)} />
                    <Stat label="Tablets" value={num(totals.tablet)} />
                    <Stat label="HSI" value={num(totals.hsi)} />
                    <Stat label="Upgrades" value={num(totals.upgrade)} />
                    <Stat label="Migrations" value={num(totals.migration)} />
                </div>
            </div>
        </div>
    );
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-gray-200/70 dark:border-gray-800/70 bg-gray-50/70 dark:bg-gray-900/30 px-3 py-2">
            <div className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</div>
            <div className="mt-1 text-sm font-extrabold text-gray-900 dark:text-gray-100">{value}</div>
        </div>
    );
}