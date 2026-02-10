"use client";

import type { TodayGoalRow } from "@/types/todayGoal";
import StoreTodayGoalCard from "@/components/goals/StoreTodayGoalCard";

export default function TodayGoalsGrid({ rows }: { rows: TodayGoalRow[] }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {rows.map((r) => (
                <StoreTodayGoalCard key={r.store.dealerStoreId} row={r} />
            ))}
        </div>
    );
}