"use client";

import React from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Props {
    calendarRef: React.RefObject<HTMLDivElement | null>;
    showCalendar: boolean;
    onToggle: () => void;
    range: [Date | null, Date | null];
    onRangeChange: (start: Date | null, end: Date | null) => void;
    onClear: () => void;
    startLabel: string;
    endLabel: string;
}

export default function DateRangePopover({
    calendarRef,
    showCalendar,
    onToggle,
    range,
    onRangeChange,
    onClear,
    startLabel,
    endLabel,
}: Props) {
    return (
        <div className="relative flex flex-wrap items-center gap-3" ref={calendarRef}>
            <button
                type="button"
                onClick={onToggle}
                className="text-xs px-3 py-2 rounded-md border border-indigo-200 dark:border-indigo-600 text-indigo-700 dark:text-indigo-200 bg-indigo-50 dark:bg-indigo-900/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition"
            >
                {showCalendar ? "Hide calendar" : "Select upload date range"}
            </button>
            <div className="flex items-center gap-2 text-sm">
                <span className="px-3 py-2 rounded-lg bg-indigo-100 text-indigo-900 dark:bg-indigo-900/50 dark:text-indigo-100 font-semibold border border-indigo-200 dark:border-indigo-700 shadow-sm">
                    Start: {startLabel || "—"}
                </span>
                <span className="px-3 py-2 rounded-lg bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-100 font-semibold border border-amber-200 dark:border-amber-700 shadow-sm">
                    End: {endLabel || "—"}
                </span>
            </div>

            {showCalendar && (
                <div className="absolute left-0 top-full mt-2 z-50 w-[360px]">
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 space-y-3 shadow-2xl">
                        <ReactDatePicker
                            selected={range[0]}
                            startDate={range[0]}
                            endDate={range[1]}
                            onChange={(dates) => {
                                const [start, end] = dates as [Date | null, Date | null];
                                onRangeChange(start, end);
                            }}
                            selectsRange
                            inline
                            calendarClassName="rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900"
                            dayClassName={(date) => {
                                if (range[0] && range[1] && date >= range[0] && date <= range[1]) {
                                    return "bg-indigo-600 text-white rounded-full";
                                }
                                return "";
                            }}
                        />
                        <div className="flex items-center gap-3 text-xs text-gray-700 dark:text-gray-300">
                            <button
                                type="button"
                                onClick={onClear}
                                className="ml-auto text-xs px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-200/70 dark:hover:bg-gray-700 transition"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
