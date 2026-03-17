"use client";

import React from "react";
import { FileExportResult } from "@/types/fileExportTypes";

interface Props {
    result: FileExportResult | null;
    visible: boolean;
    onHide: () => void;
}

export default function UploadSummary({ result, visible, onHide }: Props) {
    if (!result || !visible) {
        return null;
    }
    return (
        <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Upload summary</p>
                <button
                    type="button"
                    onClick={onHide}
                    className="text-xs px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                    Hide
                </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <SummaryTile label="Total" value={result.totalRecords} />
                <SummaryTile label="Success" value={result.successCount} tone="success" />
                <SummaryTile label="Skipped" value={result.skippedFeatureCount} tone="warning" />
                <SummaryTile label="Errors" value={result.errorCount} tone="danger" />
                <SummaryTile label="Duplicates" value={result.duplicateCount} tone="info" />
                <SummaryTile label="Time" value={result.processingTime} />
            </div>
        </div>
    );
}

function SummaryTile({
    label,
    value,
    tone = "default",
}: {
    label: string;
    value: string | number;
    tone?: "default" | "success" | "warning" | "danger" | "info";
}) {
    const tones: Record<"default" | "success" | "warning" | "danger" | "info", string> = {
        default: "border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100",
        success: "border-green-200 dark:border-green-700 text-green-800 dark:text-green-200",
        warning: "border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-200",
        danger: "border-rose-200 dark:border-rose-700 text-rose-800 dark:text-rose-200",
        info: "border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200",
    };

    return (
        <div className={`rounded-lg border p-3 bg-white dark:bg-gray-900 shadow-sm ${tones[tone]}`}>
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-lg font-semibold mt-1">{value}</p>
        </div>
    );
}
