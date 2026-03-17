"use client";

import React from "react";
import { UploadedReport } from "@/types/fileExportTypes";
import { format, parseISO } from "date-fns";

interface Props {
    uploads: UploadedReport[];
    loading: boolean;
    sortAsc: boolean;
    onToggleSort: () => void;
    hasRange: boolean;
}

export default function RecentUploadsTable({ uploads, loading, sortAsc, onToggleSort, hasRange }: Props) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Recent uploads</p>
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span>{hasRange ? "Filtered by selected range" : "Last 5 uploads"}</span>
                    <button
                        type="button"
                        onClick={onToggleSort}
                        className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-200"
                    >
                        Sort by start date {sortAsc ? "▲" : "▼"}
                    </button>
                </div>
            </div>
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-0 overflow-hidden">
                {loading ? (
                    <p className="p-3 text-sm text-gray-500 dark:text-gray-400">Loading uploads…</p>
                ) : uploads.length === 0 ? (
                    <p className="p-3 text-sm text-gray-500 dark:text-gray-400">No uploads found.</p>
                ) : (
                    <div className="w-full overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                                <tr>
                                    <th className="px-4 py-2 text-left font-semibold">File Name</th>
                                    <th className="px-4 py-2 text-left font-semibold">Uploaded</th>
                                    <th className="px-4 py-2 text-left font-semibold">Start Date</th>
                                    <th className="px-4 py-2 text-left font-semibold">End Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {uploads.map((item, idx) => (
                                    <tr key={`${item.fileName}-${idx}`} className="border-t border-gray-100 dark:border-gray-800">
                                        <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{item.fileName}</td>
                                        <td className="px-4 py-2 text-gray-800 dark:text-gray-200">
                                            {format(parseISO(item.uploadedDate), "MMM d, yyyy")} at {item.uploadedTime.slice(0, 5)}
                                        </td>
                                        <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{item.startDate}</td>
                                        <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{item.endDate}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
