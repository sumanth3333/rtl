"use client";

import { useEffect, useState } from "react";

interface EditableTableProps {
    title: string;
    columns: string[]; // Bill types (excluding "Store")
    data: Record<string, number | string>[]; // Rows: { store: "W26TH", GAS: 69.63, ... }
    onUpdate: (updatedData: any[]) => void;
}

export default function EditableTable({ title, columns, data, onUpdate }: EditableTableProps) {
    const [tableData, setTableData] = useState(data);
    const [totals, setTotals] = useState<Record<string, number>>({});

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
        columns.forEach((col) => {
            totalRow[col] = tableData.reduce((sum, row) => sum + (parseFloat(row[col] as string) || 0), 0);
        });
        setTotals(totalRow);
    };

    return (
        <div className="mt-6 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-3">{title}</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm md:text-base border-collapse border border-gray-300 dark:border-gray-700">
                    <thead>
                        <tr className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-300">
                            <th className="p-3 text-left">Store</th>
                            {columns.map((col) => (
                                <th key={col} className="p-3 text-center">{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.map((row, rowIndex) => (
                            <tr key={rowIndex} className="border-b border-gray-300 dark:border-gray-700">
                                <td className="p-3 font-semibold">{row.store}</td>
                                {columns.map((col) => (
                                    <td key={col} className="p-2 text-center">
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={row[col] ?? ""}
                                            onChange={(e) => handleChange(rowIndex, col, e.target.value)}
                                            className="w-full p-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white text-center"
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}

                        {/* ✅ Totals Row */}
                        <tr className="bg-gray-300 dark:bg-gray-700 font-bold text-gray-800 dark:text-white">
                            <td className="p-3">TOTAL</td>
                            {columns.map((col) => (
                                <td key={col} className="p-3 text-center">
                                    {totals[col]?.toFixed(2) ?? "0.00"}
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
