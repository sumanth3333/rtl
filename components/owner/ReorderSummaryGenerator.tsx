"use client";

import { useState } from "react";
import { ReorderSummaryData } from "@/types/reorderSummaryTypes";

interface ReorderSummaryGeneratorProps {
    data: ReorderSummaryData[];
}

export default function ReorderSummaryGenerator({ data }: ReorderSummaryGeneratorProps) {
    const [summary, setSummary] = useState<string>("");

    const generateSummary = () => {
        const storeSummaries = data
            .map((store) => {
                const reorderItems = store.inventory
                    .filter((item) => item.currentQuantity < item.minimumQuantity)
                    .map((item) => `- ${item.productName}: ${item.minimumQuantity - item.currentQuantity}`)
                    .join("\n");

                return reorderItems ? `**${store.store.storeName}**\n${reorderItems}` : "";
            })
            .filter((storeSummary) => storeSummary.trim() !== "") // Remove empty stores
            .join("\n\n");

        setSummary(storeSummaries);
    };

    return (
        <div className="mt-4">
            <button
                onClick={generateSummary}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
                Generate Reorder Summary
            </button>

            {summary && (
                <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">📦 Reorder Summary</h4>
                    <textarea
                        className="w-full h-40 p-3 border rounded-md bg-white dark:bg-gray-900 dark:text-white font-mono"
                        readOnly
                        value={summary}
                    />
                    <button
                        onClick={() => navigator.clipboard.writeText(summary)}
                        className="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                        Copy to Clipboard
                    </button>
                </div>
            )}
        </div>
    );
}
