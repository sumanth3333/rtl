"use client";

import type { StoreCurrentTrends } from "@/types/storeTrends";

type Props = {
    storeName?: string;
    trends: StoreCurrentTrends | null;
    loading?: boolean;
};

const pct = (n?: number) => `${Math.round(Number(n ?? 0))}%`;

function chipClass(p: number) {
    if (p >= 85) { return "bg-green-50 text-green-700 border-green-200"; }
    if (p >= 50) { return "bg-blue-50 text-blue-700 border-blue-200"; }
    if (p >= 25) { return "bg-yellow-50 text-yellow-800 border-yellow-200"; }
    return "bg-red-50 text-red-700 border-red-200";
}

export default function StoreCurrentTrendsCard({ storeName, trends, loading }: Props) {
    const p100 = Math.round(trends?.totalGoalAcheivedPercentage ?? 0);
    const p125 = Math.round(trends?.totalMaximumPerformanceBonusAcheivedPercentage ?? 0);

    return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        📈 Current Trends
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {storeName ? `Store: ${storeName}` : "Store trend snapshot for this month"}
                    </p>
                </div>

                <div className="flex gap-2">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${chipClass(p100)}`}>
                        100%: {pct(p100)}
                    </span>
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${chipClass(p125)}`}>
                        125%: {pct(p125)}
                    </span>
                </div>
            </div>

            {loading ? (
                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading trends...</div>
            ) : !trends ? (
                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">No trends available.</div>
            ) : (
                <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="py-2 text-left">Metric</th>
                                <th className="py-2 text-right">Value</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            <tr>
                                <td className="py-2 text-gray-700 dark:text-gray-200">Current (Achieved)</td>
                                <td className="py-2 text-right font-semibold text-gray-900 dark:text-white">
                                    {trends.acheivedTillDate}
                                </td>
                            </tr>

                            <tr>
                                <td className="py-2 text-gray-700 dark:text-gray-200">Goal (100%)</td>
                                <td className="py-2 text-right text-gray-900 dark:text-white">
                                    {trends.totalBoxes}
                                </td>
                            </tr>

                            <tr>
                                <td className="py-2 text-gray-700 dark:text-gray-200">Left to 100%</td>
                                <td className="py-2 text-right font-semibold text-gray-900 dark:text-white">
                                    {trends.currentDifference}
                                </td>
                            </tr>

                            <tr>
                                <td className="py-2 text-gray-700 dark:text-gray-200">Goal (125%)</td>
                                <td className="py-2 text-right text-gray-900 dark:text-white">
                                    {trends.maximumPerformanceBonusGoal}
                                </td>
                            </tr>

                            <tr>
                                <td className="py-2 text-gray-700 dark:text-gray-200">Left to 125%</td>
                                <td className="py-2 text-right font-semibold text-gray-900 dark:text-white">
                                    {trends.currentDifferenceForMaximumPerformanceGoal}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
