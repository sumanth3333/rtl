"use client";

import { useMemo, useState } from "react";
import { ChevronUpIcon, ChevronDownIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline";

export interface MetricReportRow {
    key: string;
    primaryLabel: string;
    secondaryLabel: string;
    activations: number;
    upgrades: number;
    migration: number;
    accessories: number;
    bts: number;
    hsi: number;
    freelines: number;
    totalActivations: number;
    totalBoxes: number;
}

type NumericKey = Exclude<keyof MetricReportRow, "key" | "primaryLabel" | "secondaryLabel">;
type SortKey = NumericKey | "primaryLabel";

interface Column {
    key: NumericKey;
    label: string;
    format?: (value: number) => string;
    emphasize?: boolean;
}

const currency = (value: number) =>
    value.toLocaleString("en-US", { style: "currency", currency: "USD" });

const columns: Column[] = [
    { key: "activations", label: "Activations" },
    { key: "upgrades", label: "Upgrades" },
    { key: "migration", label: "Migrations" },
    { key: "accessories", label: "Accessories", format: currency },
    { key: "bts", label: "BTS" },
    { key: "hsi", label: "HSI" },
    { key: "freelines", label: "Free Lines" },
    { key: "totalActivations", label: "Total Activations", emphasize: true },
    { key: "totalBoxes", label: "Total Boxes", emphasize: true },
];

interface MetricReportTableProps {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    entityLabel: string;
    rows: MetricReportRow[];
    accent?: "blue" | "indigo";
}

export default function MetricReportTable({ title, icon: Icon, entityLabel, rows, accent = "blue" }: MetricReportTableProps) {
    const [sortKey, setSortKey] = useState<SortKey>("totalBoxes");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

    const sortedRows = useMemo(() => {
        const copy = [...rows];
        copy.sort((a, b) => {
            const dir = sortDir === "asc" ? 1 : -1;
            if (sortKey === "primaryLabel") {
                return a.primaryLabel.localeCompare(b.primaryLabel, undefined, { sensitivity: "base" }) * dir;
            }
            return (a[sortKey] - b[sortKey]) * dir;
        });
        return copy;
    }, [rows, sortKey, sortDir]);

    const totals = useMemo(
        () =>
            rows.reduce(
                (acc, row) => {
                    acc.activations += row.activations;
                    acc.upgrades += row.upgrades;
                    acc.migration += row.migration;
                    acc.accessories += row.accessories;
                    acc.bts += row.bts;
                    acc.hsi += row.hsi;
                    acc.freelines += row.freelines;
                    acc.totalActivations += row.totalActivations;
                    acc.totalBoxes += row.totalBoxes;
                    return acc;
                },
                { activations: 0, upgrades: 0, migration: 0, accessories: 0, bts: 0, hsi: 0, freelines: 0, totalActivations: 0, totalBoxes: 0 }
            ),
        [rows]
    );

    const toggleSort = (key: SortKey) => {
        if (key === sortKey) {
            setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortKey(key);
            setSortDir(key === "primaryLabel" ? "asc" : "desc");
        }
    };

    const SortIcon = ({ column }: { column: SortKey }) => {
        if (column !== sortKey) {
            return <ChevronUpDownIcon className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600" />;
        }
        return sortDir === "asc" ? (
            <ChevronUpIcon className="h-3.5 w-3.5 text-current" />
        ) : (
            <ChevronDownIcon className="h-3.5 w-3.5 text-current" />
        );
    };

    const headerAccent =
        accent === "indigo"
            ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200"
            : "bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200";

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                <Icon className={`h-5 w-5 ${accent === "indigo" ? "text-indigo-500" : "text-blue-500"}`} />
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
                <span className="ml-auto text-xs font-medium text-gray-400 dark:text-gray-500">
                    {rows.length} {rows.length === 1 ? entityLabel.toLowerCase() : `${entityLabel.toLowerCase()}s`}
                </span>
            </div>

            {rows.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-10">
                    No {entityLabel.toLowerCase()} data found for the selected range.
                </p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className={headerAccent}>
                                <th className="sticky left-0 z-10 bg-inherit px-4 py-3 text-left font-semibold whitespace-nowrap">
                                    <button
                                        type="button"
                                        onClick={() => toggleSort("primaryLabel")}
                                        className="inline-flex items-center gap-1 hover:opacity-75 transition-opacity"
                                    >
                                        {entityLabel}
                                        <SortIcon column="primaryLabel" />
                                    </button>
                                </th>
                                {columns.map((col) => (
                                    <th key={col.key} className="px-4 py-3 text-right font-semibold whitespace-nowrap">
                                        <button
                                            type="button"
                                            onClick={() => toggleSort(col.key)}
                                            className="inline-flex items-center gap-1 hover:opacity-75 transition-opacity"
                                        >
                                            <SortIcon column={col.key} />
                                            {col.label}
                                        </button>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {sortedRows.map((row, index) => (
                                <tr
                                    key={row.key}
                                    className={`border-b border-gray-100 dark:border-gray-800 ${index % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50/60 dark:bg-gray-800/40"
                                        } hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
                                >
                                    <td className="sticky left-0 z-10 bg-inherit px-4 py-3 whitespace-nowrap">
                                        <div className="font-medium text-gray-900 dark:text-gray-100">{row.primaryLabel}</div>
                                        <div className="text-xs text-gray-400 dark:text-gray-500">{row.secondaryLabel}</div>
                                    </td>
                                    {columns.map((col) => (
                                        <td
                                            key={col.key}
                                            className={`px-4 py-3 text-right tabular-nums whitespace-nowrap ${col.emphasize
                                                ? "font-semibold text-gray-900 dark:text-gray-100"
                                                : "text-gray-600 dark:text-gray-300"
                                                }`}
                                        >
                                            {col.format ? col.format(row[col.key]) : row[col.key].toLocaleString("en-US")}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="border-t-2 border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/80 font-semibold">
                                <td className="sticky left-0 z-10 bg-inherit px-4 py-3 text-gray-900 dark:text-gray-100 whitespace-nowrap">
                                    Total
                                </td>
                                {columns.map((col) => (
                                    <td key={col.key} className="px-4 py-3 text-right tabular-nums text-gray-900 dark:text-gray-100 whitespace-nowrap">
                                        {col.format ? col.format(totals[col.key]) : totals[col.key].toLocaleString("en-US")}
                                    </td>
                                ))}
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}
        </div>
    );
}
