"use client";

import { CalendarDays } from "lucide-react";
import { StoreTodayGoal } from "@/types/storeGoalStrategy";
import { iconForMetric } from "./metricIcons";

interface Props {
    dailyGoal: StoreTodayGoal | null;
}

const safeNumber = (val: unknown) => (typeof val === "number" ? val : 0);

export default function DailyGoalSummary({ dailyGoal }: Props) {
    if (!dailyGoal) {
        return (
            <div className="h-full flex flex-col justify-center bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400 text-center">No goals set for today.</p>
            </div>
        );
    }

    const goals = [
        { label: "Activations", value: safeNumber(dailyGoal.activations) },
        { label: "BTS", value: safeNumber(dailyGoal.bts) },
        { label: "HSI", value: safeNumber(dailyGoal.hsi) },
        { label: "Migrations", value: safeNumber(dailyGoal.migrations) },
        { label: "Accessories", value: `$${safeNumber(dailyGoal.accessories).toFixed(2)}` },
    ];

    return (
        <div className="h-full flex flex-col min-w-0 bg-white dark:bg-gray-900 p-4 lg:p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-baseline justify-between gap-2">
                <h2 className="flex items-center gap-2 text-lg lg:text-xl font-semibold text-gray-800 dark:text-gray-200">
                    <CalendarDays className="w-5 h-5 shrink-0" />
                    Today&apos;s Store Goal
                </h2>
                {dailyGoal.date && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">{dailyGoal.date}</span>
                )}
            </div>
            {/* Columns adapt to whatever width this card actually has (sidebar, split layouts, etc.) instead of guessing viewport breakpoints */}
            <div className="flex-1 grid grid-cols-[repeat(auto-fit,minmax(110px,1fr))] gap-2.5 mt-4">
                {goals.map((goal) => {
                    const Icon = iconForMetric(goal.label);
                    return (
                        <div
                            key={goal.label}
                            className="flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5 shadow-sm min-w-0"
                        >
                            <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{goal.label}</span>
                            <span className="text-base font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">{goal.value}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
