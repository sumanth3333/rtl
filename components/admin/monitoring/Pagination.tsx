"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
    page,
    totalPages,
    totalElements,
    hasNext,
    hasPrevious,
    onPageChange,
}: {
    page: number;
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
    hasPrevious: boolean;
    onPageChange: (page: number) => void;
}) {
    if (totalElements === 0) { return null; }

    return (
        <div className="flex items-center justify-between px-1 py-3 text-xs text-gray-500 dark:text-gray-400">
            <p>
                Page <span className="font-medium text-gray-700 dark:text-gray-300">{page + 1}</span> of{" "}
                <span className="font-medium text-gray-700 dark:text-gray-300">{Math.max(totalPages, 1)}</span>
                {" · "}
                {totalElements} total {totalElements === 1 ? "record" : "records"}
            </p>
            <div className="flex items-center gap-1.5">
                <button
                    type="button"
                    disabled={!hasPrevious}
                    onClick={() => onPageChange(page - 1)}
                    className="inline-flex items-center gap-1 rounded-md border border-gray-200 dark:border-gray-700 px-2.5 py-1.5 font-medium text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                    <ChevronLeft className="w-3.5 h-3.5" /> Prev
                </button>
                <button
                    type="button"
                    disabled={!hasNext}
                    onClick={() => onPageChange(page + 1)}
                    className="inline-flex items-center gap-1 rounded-md border border-gray-200 dark:border-gray-700 px-2.5 py-1.5 font-medium text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                    Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}
