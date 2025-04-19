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
}

export default function EditableTable({ title, columnKeys, columnLabels, data, onUpdate, onSave }: EditableTableProps) {
    const [tableData, setTableData] = useState(data);
    const [totals, setTotals] = useState<Record<string, number>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<string | null>(null);

    useEffect(() => {
        setTableData(data);
    }, [data]);

    useEffect(() => {
        calculateTotals();
    }, [tableData]);

    const handleChange = (rowIndex: number, key: string, value: string | number) => {
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
            setSaveStatus("✅ Saved successfully.");
        } catch {
            setSaveStatus("❌ Failed to save.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="mt-6 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">{title}</h3>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-semibold disabled:opacity-50"
                >
                    {isSaving ? "Saving..." : "Save"}
                </button>
            </div>

            {saveStatus && (
                <p className="text-sm mb-2 text-center text-green-500 dark:text-green-400">{saveStatus}</p>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-sm md:text-base border-collapse border border-gray-300 dark:border-gray-700">
                    <thead>
                        <tr className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-300">
                            <th className="p-3 text-left">Dealer Store</th>
                            {columnLabels.map((label) => (
                                <th key={label} className="p-3 text-center">{label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.map((row, rowIndex) => (
                            <tr key={rowIndex} className="border-b border-gray-300 dark:border-gray-700">
                                <td className="p-3 font-semibold">{row.dealerStoreId}</td>
                                {columnKeys.map((key) => (
                                    <td key={key} className="p-2 text-center">
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={String(row[key] ?? "")} // ✅ Safe casting
                                            onChange={(e) => handleChange(rowIndex, key, e.target.value)}
                                            className="w-full p-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white text-center"
                                        />

                                    </td>
                                ))}
                            </tr>
                        ))}

                        <tr className="bg-gray-300 dark:bg-gray-700 font-bold text-gray-800 dark:text-white">
                            <td className="p-3">TOTAL</td>
                            {columnKeys.map((key) => (
                                <td key={key} className="p-3 text-center">
                                    {totals[key]?.toFixed(2) ?? "0.00"}
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}