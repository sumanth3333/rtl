"use client";

import { useEffect, useState } from "react";

interface OtherExpense {
    expenseId?: number; // null/undefined for new
    paymentMode: string;
    paidTo: string;
    paidFor: string;
    amount: number;
    month: string;
    paidDate: string;
    expenseRecordedDate: string;
    isNew?: boolean;
    isEdited?: boolean;
}

interface OtherExpensesTableProps {
    data: OtherExpense[];
    companyName: string;
    month: string;
    onUpdate: (updated: OtherExpense[]) => void;
    onSave: (updated: OtherExpense[]) => Promise<void>;
}

const paymentModes = ["Cash", "Card"];
const paidForOptions = [
    "Accessories Order",
    "Insurance",
    "OneClick",
    "Promo Codes",
    "Shipping Fee",
    "Store Supplies",
].sort();

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
    const [editableRowIds, setEditableRowIds] = useState<Set<number>>(new Set());

    useEffect(() => {
        setTableData(data); // ← Remove setting isEdited/isNew here
    }, [data]);

    const handleChange = (index: number, field: keyof OtherExpense, value: string | number) => {
        const updated = [...tableData];
        const row = { ...updated[index] };

        if (field === "amount") {
            row.amount = parseFloat(value as string);
        } else {
            (row as any)[field] = value;
        }

        if (!row.isNew) {
            row.isEdited = true;
        }

        updated[index] = row;
        setTableData(updated);
        onUpdate(updated);
    };

    const handleAddRow = () => {
        const newRow: OtherExpense = {
            paymentMode: "",
            paidTo: "",
            paidFor: "",
            amount: 0,
            month,
            paidDate: new Date().toISOString().slice(0, 10),
            expenseRecordedDate: new Date().toISOString().slice(0, 10),
            isNew: true,
            isEdited: true,
        };
        const updated = [...tableData, newRow];
        setTableData(updated);
        onUpdate(updated);
    };

    const handleDeleteRow = (index: number) => {
        const updated = [...tableData];
        updated.splice(index, 1);
        setTableData(updated);
        onUpdate(updated);
    };

    const getTotalAmount = () =>
        tableData.reduce((sum, row) => sum + (row.amount || 0), 0).toFixed(2);

    const handleSave = async () => {
        setIsSaving(true);
        setSaveStatus(null);

        try {
            const changedRows = tableData.filter(row => row.isNew || row.isEdited);

            if (changedRows.length === 0) {
                setSaveStatus("⚠️ No changes to save.");
                return;
            }

            await onSave(changedRows);

            const cleaned = tableData.map(row => ({
                ...row,
                isNew: false,
                isEdited: false,
            }));

            setTableData(cleaned);
            onUpdate(cleaned);
            setSaveStatus("✅ Saved successfully.");
        } catch (err: any) {
            setSaveStatus(err?.response?.data?.message || err?.message || "❌ Failed to save.");
        } finally {
            setIsSaving(false);
            setTimeout(() => setSaveStatus(null), 4000);
        }
    };

    return (
        <div className="mt-10">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3 gap-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">💸 Other Expenses</h3>
                <div className="flex gap-2">
                    <button onClick={handleAddRow} className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 text-sm">
                        Add New Expense
                    </button>
                    <button onClick={handleSave} disabled={isSaving} className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 text-sm">
                        {isSaving ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>

            {saveStatus && <p className="text-sm mb-2 text-center text-green-500 dark:text-green-400">{saveStatus}</p>}

            <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse border border-gray-300 dark:border-gray-700">
                    <thead>
                        <tr className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-300">
                            <th className="p-3">Payment Mode</th>
                            <th className="p-3">Paid To</th>
                            <th className="p-3">Paid For</th>
                            <th className="p-3 text-center">Amount</th>
                            <th className="p-3 text-center">Paid Date</th>
                            <th className="p-3 text-center">Recorded Date</th>
                            <th className="p-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.map((item, index) => {
                            const isEditable = item.isNew || (item.expenseId && editableRowIds.has(item.expenseId));

                            return (
                                <tr key={index} className="border-b border-gray-300 dark:border-gray-700">
                                    <td className="p-2">
                                        {isEditable ? (
                                            <input
                                                list={`payment-mode-${index}`}
                                                value={item.paymentMode}
                                                onChange={(e) => handleChange(index, "paymentMode", e.target.value)}
                                                className="w-full p-1 rounded bg-white dark:bg-gray-900 text-center"
                                            />
                                        ) : (
                                            item.paymentMode
                                        )}
                                        <datalist id={`payment-mode-${index}`}>
                                            {paymentModes.map((mode) => (
                                                <option key={mode} value={mode} />
                                            ))}
                                        </datalist>
                                    </td>
                                    <td className="p-2 text-center">
                                        {isEditable ? (
                                            <input
                                                type="text"
                                                value={item.paidTo}
                                                onChange={(e) => handleChange(index, "paidTo", e.target.value)}
                                                className="w-full p-1 rounded bg-white dark:bg-gray-900 text-center"
                                            />
                                        ) : (
                                            item.paidTo
                                        )}
                                    </td>
                                    <td className="p-2 text-center">
                                        {isEditable ? (
                                            <input
                                                list={`paid-for-${index}`}
                                                value={item.paidFor}
                                                onChange={(e) => handleChange(index, "paidFor", e.target.value)}
                                                className="w-full p-1 rounded bg-white dark:bg-gray-900 text-center"
                                            />
                                        ) : (
                                            item.paidFor
                                        )}
                                        <datalist id={`paid-for-${index}`}>
                                            {paidForOptions.map((option) => (
                                                <option key={option} value={option} />
                                            ))}
                                        </datalist>
                                    </td>
                                    <td className="p-2 text-center">
                                        {isEditable ? (
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={item.amount}
                                                onChange={(e) => handleChange(index, "amount", e.target.value)}
                                                className="w-full p-1 rounded bg-white dark:bg-gray-900 text-center"
                                            />
                                        ) : (
                                            `$${item.amount.toFixed(2)}`
                                        )}
                                    </td>
                                    <td className="p-2 text-center">
                                        {isEditable ? (
                                            <input
                                                type="date"
                                                value={item.paidDate}
                                                onChange={(e) => handleChange(index, "paidDate", e.target.value)}
                                                className="w-full p-1 rounded bg-white dark:bg-gray-900 text-center"
                                            />
                                        ) : (
                                            item.paidDate
                                        )}
                                    </td>
                                    <td className="p-2 text-center">
                                        {isEditable ? (
                                            <input
                                                type="date"
                                                value={item.expenseRecordedDate}
                                                onChange={(e) => handleChange(index, "expenseRecordedDate", e.target.value)}
                                                className="w-full p-1 rounded bg-white dark:bg-gray-900 text-center"
                                            />
                                        ) : (
                                            item.expenseRecordedDate
                                        )}
                                    </td>
                                    <td className="p-2 text-center">
                                        {item.isNew ? (
                                            <button
                                                onClick={() => handleDeleteRow(index)}
                                                className="text-red-500 text-sm font-medium hover:underline"
                                            >
                                                Delete
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    const newSet = new Set(editableRowIds);
                                                    if (newSet.has(item.expenseId!)) {
                                                        newSet.delete(item.expenseId!);
                                                    } else {
                                                        newSet.add(item.expenseId!);
                                                    }
                                                    setEditableRowIds(newSet);
                                                }}
                                                className="text-blue-500 text-sm font-medium hover:underline"
                                            >
                                                {editableRowIds.has(item.expenseId!) ? "Cancel" : "Edit"}
                                            </button>

                                        )}
                                    </td>
                                </tr>
                            );
                        })}

                        <tr className="bg-gray-300 dark:bg-gray-700 font-bold text-gray-800 dark:text-white">
                            <td className="p-3 text-right" colSpan={3}>TOTAL</td>
                            <td className="p-3 text-center">${getTotalAmount()}</td>
                            <td colSpan={3} />
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
