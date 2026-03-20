// EditableTable.tsx
"use client";

import { useEffect, useState } from "react";

interface EditableTableProps {
    title: string;
    columnKeys: string[];
    columnLabels: string[];
    data: Record<string, number | string>[];
    onUpdate: (updatedData: any[]) => void;
    onSave: (updatedData: any[]) => Promise<void>;
    resetKey?: string; // e.g., selectedMonth — used to refresh snapshot on server reloads
}

export default function EditableTable({ title, columnKeys, columnLabels, data, onUpdate, onSave, resetKey }: EditableTableProps) {
    const [tableData, setTableData] = useState(data);
    const [savedSnapshot, setSavedSnapshot] = useState(data);
    const [totals, setTotals] = useState<Record<string, number>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<string | null>(null);
    const [quickFillKey, setQuickFillKey] = useState<string>("");
    const [quickFillValue, setQuickFillValue] = useState<string>("");
    const [onlyEmpty, setOnlyEmpty] = useState<boolean>(true);
    const grandTotal = tableData.reduce((sum, row) => {
        return sum + columnKeys.reduce((subSum, key) => {
            const val = parseFloat(row[key] as string);
            return subSum + (isNaN(val) ? 0 : val);
        }, 0);
    }, 0);

    // Keep local table in sync with incoming data, but avoid overwriting savedSnapshot
    // so dirty tracking persists across prop updates triggered by onUpdate.
    useEffect(() => {
        setTableData(data);
    }, [data]);

    // When resetKey changes (e.g., switching months), refresh snapshot to new server data.
    useEffect(() => {
        setTableData(data);
        setSavedSnapshot(data);
    }, [resetKey, data]);

    useEffect(() => {
        // Default the quick-fill dropdown to the first available column
        if (columnKeys.length > 0) {
            setQuickFillKey((current) => current || columnKeys[0]);
        }
    }, [columnKeys]);

    useEffect(() => {
        calculateTotals();
    }, [tableData]);

    const handleChange = (rowIndex: number, key: string, value: string | number) => {
        const asString = String(value);

        // If user pasted multiple lines, fill down the column starting at this row
        if (asString.includes("\n")) {
            const lines = asString
                .split(/\r?\n/)
                .map((line) => line.trim())
                .filter((line) => line.length > 0);

            const updated = tableData.map((row, i) => {
                const offset = i - rowIndex;
                if (offset < 0 || offset >= lines.length) { return row; }
                const parsed = parseFloat(lines[offset]);
                return { ...row, [key]: isNaN(parsed) ? lines[offset] : parsed };
            });

            setTableData(updated);
            onUpdate(updated);
            return;
        }

        // Single value edit
        const updated = tableData.map((row, i) =>
            i === rowIndex ? { ...row, [key]: isNaN(Number(value)) ? value : parseFloat(value as string) } : row
        );
        setTableData(updated);
        onUpdate(updated);
    };

    const calculateTotals = () => {
        const totalRow: Record<string, number> = {};
        columnKeys.forEach((key) => {
            totalRow[key] = tableData.reduce((sum, row) => sum + (parseFloat(row[key] as string) || 0), 0);
        });
        setTotals(totalRow);
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveStatus(null);
        try {
            await onSave(tableData);
            setSavedSnapshot(tableData);
            setSaveStatus("✅ Saved successfully.");
        } catch {
            setSaveStatus("❌ Failed to save.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleQuickFill = () => {
        if (!quickFillKey) { return; }
        const numericValue = parseFloat(quickFillValue);
        if (isNaN(numericValue)) { return; }

        const updated = tableData.map((row) => {
            const currentVal = parseFloat(row[quickFillKey] as string);
            if (onlyEmpty && !isNaN(currentVal) && currentVal !== 0) {
                return row; // skip rows that already have a value
            }
            return { ...row, [quickFillKey]: numericValue };
        });

        setTableData(updated);
        onUpdate(updated);
    };

    const isDirty = (rowIndex: number, key: string) => {
        const current = tableData[rowIndex]?.[key];
        const saved = savedSnapshot[rowIndex]?.[key];
        // Treat numeric strings as numbers to avoid false positives
        const curNum = parseFloat(current as string);
        const savedNum = parseFloat(saved as string);
        if (!isNaN(curNum) || !isNaN(savedNum)) {
            return (isNaN(curNum) ? "" : curNum) !== (isNaN(savedNum) ? "" : savedNum);
        }
        return current !== saved;
    };

    return (
        <div className="mt-4 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg shadow-sm">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-2">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-200">{title}</h3>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1 bg-white dark:bg-gray-900 rounded-md px-2 py-1 shadow-inner">
                        <label className="text-[11px] text-gray-600 dark:text-gray-300">Quick fill</label>
                        <select
                            value={quickFillKey}
                            onChange={(e) => setQuickFillKey(e.target.value)}
                            className="rounded-md border px-2 py-[6px] text-xs dark:bg-gray-800"
                        >
                            {columnKeys.map((key, idx) => (
                                <option key={key} value={key}>{columnLabels[idx]}</option>
                            ))}
                        </select>
                        <input
                            type="number"
                            step="0.01"
                            value={quickFillValue}
                            onChange={(e) => setQuickFillValue(e.target.value)}
                            placeholder="Amount"
                            className="w-24 rounded-md border px-2 py-[6px] text-xs text-right dark:bg-gray-800"
                        />
                        <label className="flex items-center gap-1 text-[11px] text-gray-600 dark:text-gray-300">
                            <input
                                type="checkbox"
                                checked={onlyEmpty}
                                onChange={(e) => setOnlyEmpty(e.target.checked)}
                                className="rounded"
                            />
                            Only empty
                        </label>
                        <button
                            onClick={handleQuickFill}
                            className="bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900 px-2.5 py-1 rounded-md text-xs font-semibold"
                        >
                            Apply
                        </button>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-xs md:text-sm font-semibold disabled:opacity-50"
                    >
                        {isSaving ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>

            {saveStatus && (
                <p className="text-xs mb-2 text-center text-green-500 dark:text-green-400">{saveStatus}</p>
            )}

            <p className="text-[11px] text-gray-600 dark:text-gray-300 mb-2">
                Tip: paste a multi-line column (one amount per line) into any cell to fill down that column from the selected row.
            </p>

            <div className="overflow-x-auto">
                <table className="w-full text-xs md:text-sm border-collapse border border-gray-300 dark:border-gray-700">
                    <thead>
                        <tr className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-300">
                            <th className="px-2 py-2 text-left">Store ID</th>
                            {columnLabels.map((label) => (
                                <th key={label} className="px-2 py-2 text-center">{label}</th>
                            ))}
                            <th className="px-2 py-2 text-center">Total</th>
                        </tr>
                    </thead>

                    <tbody>
                        {tableData.map((row, rowIndex) => {
                            const rowTotal = columnKeys.reduce((sum, key) => {
                                const val = parseFloat(row[key] as string);
                                return sum + (isNaN(val) ? 0 : val);
                            }, 0);

                            return (
                                <tr key={rowIndex} className="border-b border-gray-200 dark:border-gray-700">
                                    <td className="px-2 py-2 font-semibold whitespace-nowrap">{row.dealerStoreId}</td>
                                    {columnKeys.map((key) => (
                                        <td key={key} className="px-1.5 py-1.5 text-center">
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={String(row[key] ?? "")}
                                                onChange={(e) => handleChange(rowIndex, key, e.target.value)}
                                                className={`w-full px-1.5 py-1 border rounded-md bg-white dark:bg-gray-900 dark:text-white text-center text-xs md:text-sm ${isDirty(rowIndex, key) ? "border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-700"}`}
                                            />
                                        </td>
                                    ))}
                                    <td className="px-2 py-2 text-center font-medium text-gray-800 dark:text-white">{rowTotal.toFixed(2)}</td>
                                </tr>
                            );
                        })}
                        <tr className="bg-gray-300 dark:bg-gray-700 font-bold text-gray-800 dark:text-white">
                            <td className="px-2 py-2">TOTAL</td>
                            {columnKeys.map((key) => (
                                <td key={key} className="px-2 py-2 text-center">{totals[key]?.toFixed(2) ?? "0.00"}</td>
                            ))}
                            <td className="px-2 py-2 text-center">{grandTotal.toFixed(2)}</td>
                        </tr>
                    </tbody>

                </table>
            </div>
        </div >
    );
}
