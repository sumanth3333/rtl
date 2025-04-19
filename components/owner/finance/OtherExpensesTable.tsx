"use client";

import { useEffect, useState } from "react";

interface OtherExpense {
    paymentMode: string;
    paidAt: string;
    paidTo: string;
    paidFor: string;
    amount: number;
    month: string;
    paidDate: string;
}

interface OtherExpensesTableProps {
    data: OtherExpense[];
    companyName: string;
    month: string;
    onUpdate: (updated: OtherExpense[]) => void;
    onSave: (updated: OtherExpense[]) => Promise<void>;
}

export default function OtherExpensesTable({
    data,
    companyName,
    month,
    onUpdate,
    onSave,
}: OtherExpensesTableProps) {
    const [tableData, setTableData] = useState<OtherExpense[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<string | null>(null);

    useEffect(() => {
        setTableData(data);
    }, [data]);

    const handleChange = (index: number, field: keyof OtherExpense, value: string | number) => {
        const updated = [...tableData];
        updated[index] = {
            ...updated[index],
            [field]: field === "amount" ? parseFloat(value as string) : value,
        };
        setTableData(updated);
        onUpdate(updated);
    };

    const handleAddRow = () => {
        const newRow: OtherExpense = {
            paymentMode: "",
            paidAt: "",
            paidTo: "",
            paidFor: "",
            amount: 0,
            month,
            paidDate: new Date().toISOString().slice(0, 10), // today's date
        };
        const updated = [...tableData, newRow];
        setTableData(updated);
        onUpdate(updated);
    };

    const getTotalAmount = () => {
        return tableData.reduce((sum, row) => sum + (row.amount || 0), 0).toFixed(2);
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
        <div className="mt-10 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3 gap-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">
                    💸 Other Expenses
                </h3>
                <div className="flex gap-2">
                    <button
                        onClick={handleAddRow}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm font-semibold"
                    >
                        + Add Row
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm font-semibold disabled:opacity-50"
                    >
                        {isSaving ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>

            {saveStatus && (
                <p className="text-sm mb-2 text-center text-green-500 dark:text-green-400">{saveStatus}</p>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse border border-gray-300 dark:border-gray-700">
                    <thead>
                        <tr className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-300">
                            <th className="p-3">Payment Mode</th>
                            <th className="p-3">Paid At</th>
                            <th className="p-3">Paid To</th>
                            <th className="p-3">Paid For</th>
                            <th className="p-3 text-center">Amount</th>
                            <th className="p-3 text-center">Paid Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.map((item, index) => (
                            <tr key={index} className="border-b border-gray-300 dark:border-gray-700">
                                <td className="p-2">
                                    <input
                                        type="text"
                                        value={item.paymentMode}
                                        onChange={(e) => handleChange(index, "paymentMode", e.target.value)}
                                        className="w-full p-1 rounded bg-white dark:bg-gray-900 text-center"
                                    />
                                </td>
                                <td className="p-2">
                                    <input
                                        type="text"
                                        value={item.paidAt}
                                        onChange={(e) => handleChange(index, "paidAt", e.target.value)}
                                        className="w-full p-1 rounded bg-white dark:bg-gray-900 text-center"
                                    />
                                </td>
                                <td className="p-2">
                                    <input
                                        type="text"
                                        value={item.paidTo}
                                        onChange={(e) => handleChange(index, "paidTo", e.target.value)}
                                        className="w-full p-1 rounded bg-white dark:bg-gray-900 text-center"
                                    />
                                </td>
                                <td className="p-2">
                                    <input
                                        type="text"
                                        value={item.paidFor}
                                        onChange={(e) => handleChange(index, "paidFor", e.target.value)}
                                        className="w-full p-1 rounded bg-white dark:bg-gray-900 text-center"
                                    />
                                </td>
                                <td className="p-2 text-center">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={item.amount}
                                        onChange={(e) => handleChange(index, "amount", e.target.value)}
                                        className="w-full p-1 rounded bg-white dark:bg-gray-900 text-center"
                                    />
                                </td>
                                <td className="p-2 text-center">
                                    <input
                                        type="date"
                                        value={item.paidDate}
                                        onChange={(e) => handleChange(index, "paidDate", e.target.value)}
                                        className="w-full p-1 rounded bg-white dark:bg-gray-900 text-center"
                                    />
                                </td>
                            </tr>
                        ))}

                        <tr className="bg-gray-300 dark:bg-gray-700 font-bold text-gray-800 dark:text-white">
                            <td className="p-3 text-right" colSpan={4}>
                                TOTAL
                            </td>
                            <td className="p-3 text-center">{getTotalAmount()}</td>
                            <td />
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
