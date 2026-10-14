"use client";

import { useState } from "react";
import { BuildingStorefrontIcon } from "@heroicons/react/24/outline";
import { Store } from "@/schemas/storeSchema";
import { DayOfWeek } from "@/types/scheduleTypes";

export interface WeekdayColumn {
    day: DayOfWeek;
    shortLabel: string;
    date: string;
}

interface StoreRequirementsGridProps {
    stores: Store[];
    weekdays: WeekdayColumn[];
    requirements: Record<string, Partial<Record<DayOfWeek, number>>>;
    includedStores: Record<string, boolean>;
    onChangeCell: (dealerStoreId: string, day: DayOfWeek, value: number) => void;
    onToggleStore: (dealerStoreId: string) => void;
    onBulkApply: (value: number) => void;
    onSetAllIncluded: (included: boolean) => void;
}

const formatColumnDate = (value: string) => {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export default function StoreRequirementsGrid({
    stores,
    weekdays,
    requirements,
    includedStores,
    onChangeCell,
    onToggleStore,
    onBulkApply,
    onSetAllIncluded,
}: StoreRequirementsGridProps) {
    const [bulkValue, setBulkValue] = useState(1);

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center gap-3">
                <BuildingStorefrontIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mr-auto">
                    Staffing Requirements
                </h3>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => onSetAllIncluded(true)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-md bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        Select All
                    </button>
                    <button
                        type="button"
                        onClick={() => onSetAllIncluded(false)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-md bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        Deselect All
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500 dark:text-gray-400">Set selected stores to</label>
                    <input
                        type="number"
                        min={0}
                        value={bulkValue}
                        onChange={(e) => setBulkValue(Math.max(0, Number(e.target.value) || 0))}
                        className="w-16 px-2 py-1.5 text-sm border rounded-md bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="button"
                        onClick={() => onBulkApply(bulkValue)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                    >
                        Apply to Selected
                    </button>
                </div>
            </div>

            <p className="px-5 pt-3 text-xs text-gray-500 dark:text-gray-400">
                Every store/day is staffed with 1 employee by default. Raise a cell above 1 only for days that need extra coverage — cells left at 1 (or 0) aren&apos;t sent as overrides. Uncheck a store to skip it when applying a bulk value.
            </p>

            {stores.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-10">No stores found for this company.</p>
            ) : (
                <div className="overflow-x-auto mt-3">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300">
                                <th className="sticky left-0 z-10 bg-inherit px-4 py-3 text-left font-semibold whitespace-nowrap">
                                    Store
                                </th>
                                {weekdays.map((col) => (
                                    <th key={col.day} className="px-3 py-3 text-center font-semibold whitespace-nowrap">
                                        <div>{col.shortLabel}</div>
                                        <div className="text-[11px] font-normal text-gray-400 dark:text-gray-500">
                                            {formatColumnDate(col.date)}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {stores.map((store, index) => {
                                const included = includedStores[store.dealerStoreId] ?? true;
                                return (
                                    <tr
                                        key={store.dealerStoreId}
                                        className={`border-b border-gray-100 dark:border-gray-800 ${index % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50/60 dark:bg-gray-800/40"
                                            } ${!included ? "opacity-50" : ""}`}
                                    >
                                        <td className="sticky left-0 z-10 bg-inherit px-4 py-2.5 whitespace-nowrap">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={included}
                                                    onChange={() => onToggleStore(store.dealerStoreId)}
                                                    className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span>
                                                    <div className="font-medium text-gray-900 dark:text-gray-100">{store.dealerStoreId}</div>
                                                    <div className="text-xs text-gray-400 dark:text-gray-500">{store.storeName}</div>
                                                </span>
                                            </label>
                                        </td>
                                        {weekdays.map((col) => (
                                            <td key={col.day} className="px-3 py-2.5 text-center">
                                                <input
                                                    type="number"
                                                    min={0}
                                                    disabled={!included}
                                                    value={requirements[store.dealerStoreId]?.[col.day] ?? 0}
                                                    onChange={(e) => onChangeCell(store.dealerStoreId, col.day, Math.max(0, Number(e.target.value) || 0))}
                                                    className="w-14 px-2 py-1.5 text-center text-sm border rounded-md bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
