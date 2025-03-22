"use client";

import { useState } from "react";

interface EditableTableProps {
    title: string;
    columns: string[];
    data: any[];
    onUpdate: (updatedData: any[]) => void;
}

export default function EditableTable({ title, columns, data, onUpdate }: EditableTableProps) {
    const [tableData, setTableData] = useState(data);

    const handleChange = (index: number, column: string, value: string | number) => {
        const updatedData = tableData.map((row, i) =>
            i === index ? { ...row, [column]: value } : row
        );
        setTableData(updatedData);
        onUpdate(updatedData);
    };

    return (
        <div className="mt-6 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-3">{title}</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm md:text-base border-collapse border border-gray-300 dark:border-gray-700">
                    <thead>
                        <tr className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-300">
                            {columns.map((col, i) => (
                                <th key={i} className="p-3 text-left">{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.map((row, rowIndex) => (
                            <tr key={rowIndex} className="border-b border-gray-300 dark:border-gray-700">
                                {columns.map((col, colIndex) => (
                                    <td key={colIndex} className="p-3">
                                        <input
                                            type="text"
                                            value={row[col] ?? ""}
                                            onChange={(e) => handleChange(rowIndex, col, e.target.value)}
                                            className="w-full p-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white"
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
