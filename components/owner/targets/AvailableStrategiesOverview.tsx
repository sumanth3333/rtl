"use client";

import { useEffect, useState } from "react";
import { fetchAvailableStrategies } from "@/services/owner/salesSprintStrategyService";
import { SalesSprintStrategy } from "@/types/salesSprintStrategyTypes";

const PHASE_FIELDS: { key: keyof SalesSprintStrategy; label: string }[] = [
    { key: "sprintOnePercentage", label: "Phase 1" },
    { key: "sprintTwoPercentage", label: "Phase 2" },
    { key: "sprintThreePercentage", label: "Phase 3" },
    { key: "sprintFourPercentage", label: "Phase 4" },
];

const formatStrategyName = (name: string) =>
    name
        .split("_")
        .filter(Boolean)
        .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
        .join(" ");

const describeStrategy = (strategy: SalesSprintStrategy) => {
    const values = PHASE_FIELDS.map((field) => Number(strategy[field.key]) || 0);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const maxIndex = values.indexOf(max);

    if (max - min <= 5) {
        return "Evenly paced — roughly equal focus across all four phases.";
    }
    if (maxIndex === 0) {
        return `Front-loaded — push hardest early with ${max}% in Phase 1, easing off through the month.`;
    }
    if (maxIndex === values.length - 1) {
        return `Back-loaded — builds steadily toward a strong finish with ${max}% in Phase 4.`;
    }
    return `Mid-month push — heaviest focus (${max}%) in Phase ${maxIndex + 1}.`;
};

export default function AvailableStrategiesOverview() {
    const [strategies, setStrategies] = useState<SalesSprintStrategy[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchAvailableStrategies();
                setStrategies(data);
            } catch (err) {
                console.error("❌ Error fetching sales phase strategies:", err);
                setError("Failed to load available strategies.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) {
        return <p className="text-sm text-gray-500 dark:text-gray-400">Loading available strategies...</p>;
    }

    if (error) {
        return <p className="text-sm text-red-500">{error}</p>;
    }

    if (strategies.length === 0) {
        return null;
    }

    return (
        <div className="h-full flex flex-col rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 p-4 space-y-3">
            <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">🏁 Phase Strategies</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    How a store&apos;s monthly goal can be split across four phases.
                </p>
            </div>

            <div className="space-y-2 flex-1">
                {strategies.map((strategy) => (
                    <div
                        key={strategy.id}
                        className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3.5 space-y-2.5"
                    >
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                            {formatStrategyName(strategy.strategyName)}
                        </p>

                        <div className="grid grid-cols-4 gap-2">
                            {PHASE_FIELDS.map((field) => (
                                <div key={field.key} className="rounded-md bg-gray-50 dark:bg-gray-800/60 px-1.5 py-1.5 text-center">
                                    <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">{field.label}</p>
                                    <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                                        {strategy[field.key]}%
                                    </p>
                                </div>
                            ))}
                        </div>

                        <p className="text-xs text-gray-600 dark:text-gray-400">{describeStrategy(strategy)}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
