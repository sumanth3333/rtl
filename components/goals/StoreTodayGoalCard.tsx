"use client";

import type { TodayGoalRow } from "@/types/todayGoal";
import GoalPill from "@/components/goals/GoalPill";
import { money, num } from "@/lib/format";

export default function StoreTodayGoalCard({ row }: { row: TodayGoalRow }) {
    const g = row.todayGoal;

    const isEmpty =
        (g.activation ?? 0) === 0 &&
        (g.accessories ?? 0) === 0 &&
        (g.tablet ?? 0) === 0 &&
        (g.hsi ?? 0) === 0 &&
        (g.upgrade ?? 0) === 0 &&
        (g.migration ?? 0) === 0;

    return (
        <div
            className="
        relative overflow-hidden rounded-2xl
        border border-gray-200/70 dark:border-gray-800/70
        bg-white/80 dark:bg-gray-950/40 backdrop-blur-xl
        shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)]
      "
        >
            <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h3 className="text-base font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
                            {row.store.storeName}
                        </h3>
                        <p className="mt-0.5 text-xs font-mono text-gray-600 dark:text-gray-400">
                            {row.store.dealerStoreId}
                        </p>
                    </div>

                    <span
                        className={[
                            "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border",
                            isEmpty
                                ? "border-gray-200/70 dark:border-gray-800/70 bg-gray-50/70 dark:bg-gray-900/30 text-gray-700 dark:text-gray-200"
                                : "border-blue-200/70 dark:border-blue-900/50 bg-blue-50/70 dark:bg-blue-950/30 text-blue-800 dark:text-blue-200",
                        ].join(" ")}
                    >
                        {isEmpty ? "No Goal" : "Active Goal"}
                    </span>
                </div>

                {/* Body */}
                <div className="mt-4 grid grid-cols-2 gap-2">
                    <GoalPill label="Activations" value={num(g.activation)} />
                    <GoalPill label="Accessories" value={money(g.accessories)} />
                    <GoalPill label="Tablets" value={num(g.tablet)} />
                    <GoalPill label="HSI" value={num(g.hsi)} />
                    <GoalPill label="Upgrades" value={num(g.upgrade)} />
                    <GoalPill label="Migrations" value={num(g.migration)} />
                </div>
            </div>
        </div>
    );
}