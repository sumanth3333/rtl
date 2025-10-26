"use client";
import React from "react";

interface DailyGoal {
    activation: number;
    accessories: number;
    tablet: number;
    hsi: number;
    upgrade: number;
    migration: number;
}

interface Props {
    dailyGoal: DailyGoal | null;
}

export default function DailyGoalSummary({ dailyGoal }: Props) {
    if (!dailyGoal) {
        return (
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400 text-center">No goals set for today.</p>
            </div>
        );
    }
    const safeNumber = (val: any) => (typeof val === "number" ? val : 0);

    const goals = [
        { label: "Activations", value: safeNumber(dailyGoal.activation) },
        { label: "Accessories ($)", value: `$${safeNumber(dailyGoal.accessories).toFixed(2)}` },
        { label: "Tablets", value: safeNumber(dailyGoal.tablet) },
        { label: "HSI", value: safeNumber(dailyGoal.hsi) },
        { label: "Upgrades", value: safeNumber(dailyGoal.upgrade) },
        { label: "Migrations", value: safeNumber(dailyGoal.migration) },
    ];


    return (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition duration-300">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                📅 Today's Store Goal
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {goals.map((goal) => (
                    <div
                        key={goal.label}
                        className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg p-3 shadow-sm"
                    >
                        <span className="text-sm text-gray-500 dark:text-gray-400">{goal.label}</span>
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {goal.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
