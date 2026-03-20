"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";

interface OtherExpense {
    expenseId?: number; // null/undefined for new
    paymentMode: string;
    paidTo: string;
    paidFor: string;
    amount: number;
    month: string;
    paidDate?: string;
    expenseRecordedDate?: string;
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
    const [editableRowIds, setEditableRowIds] = useState<Set<number | string>>(new Set());
    const paidToRefs = useRef<Array<HTMLInputElement | null>>([]);
    const [pendingFocusRow, setPendingFocusRow] = useState<number | null>(null);

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
            paymentMode: "Card",
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

            // persist only what changed to keep payload small, but ensure required fields exist
            const today = new Date().toISOString().slice(0, 10);
            const payload = changedRows.map(row => ({
                ...row,
                month: row.month || month,
                paymentMode: row.paymentMode || "Card",
                paidDate: row.paidDate || today,
                expenseRecordedDate: row.expenseRecordedDate || today,
            }));

            await onSave(payload);

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

    // Handle Enter key across input/select fields to move to next row or add one
    const handleEnter = (e: KeyboardEvent<HTMLElement>, rowIndex: number) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const targetIndex = rowIndex + 1;
            if (rowIndex === tableData.length - 1) {
                handleAddRow();
            }
            setPendingFocusRow(targetIndex);
        }
    };

    // After new row is created or data changes, move focus to Paid To of pending row
    useEffect(() => {
        if (pendingFocusRow === null) { return; }
        const input = paidToRefs.current[pendingFocusRow];
        if (input) {
            input.focus();
            input.select();
            setPendingFocusRow(null);
        }
    }, [tableData.length, pendingFocusRow]);

    const isRowEditable = (item: OtherExpense) => {
        if (item.isNew) { return true; }
        const id = item.expenseId ?? `idx-${tableData.indexOf(item)}`;
        return editableRowIds.has(id);
    };

    const toggleEdit = (item: OtherExpense) => {
        const id = item.expenseId ?? `idx-${tableData.indexOf(item)}`;
        const next = new Set(editableRowIds);
        if (next.has(id)) { next.delete(id); } else { next.add(id); }
        setEditableRowIds(next);
    };

    return (
        <div className="mt-8 bg-gray-50 dark:bg-gray-900/40 p-3 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3 gap-2">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-200">💸 Other Expenses</h3>
                <div className="flex gap-2">
                    <button onClick={handleAddRow} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-xs sm:text-sm">
                        Add Row
                    </button>
                    <button onClick={handleSave} disabled={isSaving} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-xs sm:text-sm disabled:opacity-60">
                        {isSaving ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>

            {saveStatus && <p className="text-xs sm:text-sm mb-2 text-center text-green-600 dark:text-green-400">{saveStatus}</p>}

            <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm border-collapse">
                    <thead>
                        <tr className="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-200">
                            <th className="px-2 py-2 text-left">Payment Mode</th>
                            <th className="px-2 py-2 text-left">Paid To</th>
                            <th className="px-2 py-2 text-left">Paid For</th>
                            <th className="px-2 py-2 text-center">Amount</th>
                            <th className="px-2 py-2 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.map((item, index) => {
                            const editable = isRowEditable(item);
                            return (
                                <tr key={index} className="border-b border-gray-200 dark:border-gray-800">
                                    <td className="px-2 py-1">
                                        <select
                                            value={item.paymentMode}
                                            onChange={(e) => handleChange(index, "paymentMode", e.target.value)}
                                            onKeyDown={(e) => handleEnter(e, index)}
                                            disabled={!editable}
                                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 disabled:bg-gray-100 disabled:dark:bg-gray-800"
                                        >
                                            {paymentModes.map(mode => (
                                                <option key={mode} value={mode}>{mode}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-2 py-1">
                                        <input
                                            type="text"
                                            value={item.paidTo}
                                            onChange={(e) => handleChange(index, "paidTo", e.target.value)}
                                            onKeyDown={(e) => handleEnter(e, index)}
                                            disabled={!editable}
                                            ref={(el) => {
                                                paidToRefs.current[index] = el;
                                            }}
                                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 disabled:bg-gray-100 disabled:dark:bg-gray-800"
                                            placeholder="Vendor / Person"
                                        />
                                    </td>
                                    <td className="px-2 py-1">
                                        <input
                                            list={`paid-for-${index}`}
                                            value={item.paidFor}
                                            onChange={(e) => handleChange(index, "paidFor", e.target.value)}
                                            onKeyDown={(e) => handleEnter(e, index)}
                                            disabled={!editable}
                                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 disabled:bg-gray-100 disabled:dark:bg-gray-800"
                                            placeholder="Purpose"
                                        />
                                        <datalist id={`paid-for-${index}`}>
                                            {paidForOptions.map((option) => (
                                                <option key={option} value={option} />
                                            ))}
                                        </datalist>
                                    </td>
                                    <td className="px-2 py-1 text-center">
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={item.amount}
                                            onChange={(e) => handleChange(index, "amount", e.target.value)}
                                            onKeyDown={(e) => handleEnter(e, index)}
                                            disabled={!editable}
                                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-center disabled:bg-gray-100 disabled:dark:bg-gray-800"
                                            placeholder="0.00"
                                        />
                                    </td>
                                    <td className="px-2 py-1 text-center">
                                        {item.isNew ? (
                                            <button
                                                onClick={() => handleDeleteRow(index)}
                                                className="text-red-500 text-xs sm:text-sm font-medium hover:underline"
                                            >
                                                Delete
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => toggleEdit(item)}
                                                className="text-blue-600 text-xs sm:text-sm font-medium hover:underline"
                                            >
                                                {isRowEditable(item) ? "Cancel" : "Edit"}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}

                        <tr className="bg-gray-100 dark:bg-gray-800 font-semibold text-gray-800 dark:text-gray-100">
                            <td className="px-2 py-2 text-right" colSpan={3}>TOTAL</td>
                            <td className="px-2 py-2 text-center">${getTotalAmount()}</td>
                            <td />
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
