"use client";

import { useEffect, useState } from "react";
import { getStores } from "@/services/owner/ownerService"; // Update path if needed
import { useOwner } from "@/hooks/useOwner";

export interface DealerExpense {
    dealerStoreId: string;
    expenseType: string;
    amount: number;
    recordedDate?: string;
    month?: string;
}

interface Props {
    data: DealerExpense[];
    onUpdate: (updated: DealerExpense[]) => void;
    onSave: (updated: DealerExpense[]) => Promise<void>;
}

const expenseTypeOptions = ["Performance Margin", "Flat Management Fee"];

export default function DealerExpensesTable({ data, onUpdate, onSave }: Props) {
    const { companyName } = useOwner();
    const [localData, setLocalData] = useState<DealerExpense[]>(data);
    const [storeOptions, setStoreOptions] = useState<{ storeId: string }[]>([]);
    const [saveStatus, setSaveStatus] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setLocalData(data);
    }, [data]);

    useEffect(() => {
        if (!companyName) { return };
        getStores(companyName).then((stores) => {
            setStoreOptions(stores.map(store => ({ storeId: store.dealerStoreId })));
        });
    }, [companyName]);

    const handleChange = (index: number, field: keyof DealerExpense, value: string) => {
        const updated = [...localData];
        updated[index] = {
            ...updated[index],
            [field]: field === "amount" ? parseFloat(value) : value,
        };
        setLocalData(updated);
        onUpdate(updated);
    };

    const handleAdd = () => {
        const newRow: DealerExpense = {
            dealerStoreId: "",
            expenseType: "",
            amount: 0,
        };
        const updated = [...localData, newRow];
        setLocalData(updated);
        onUpdate(updated);
    };

    const handleDelete = (index: number) => {
        const updated = localData.filter((_, i) => i !== index);
        setLocalData(updated);
        onUpdate(updated);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(localData);
            setSaveStatus("✅ Dealer expenses saved successfully.");
        } catch (err: any) {
            const message =
                err?.response?.data?.message ||
                err?.message ||
                "❌ Failed to save dealer expenses.";
            setSaveStatus(message);
        } finally {
            setIsSaving(false);
            setTimeout(() => setSaveStatus(null), 4000);
        }
    };

    return (
        <div className="mt-10">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3 gap-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">
                    Dealer Expenses
                </h3>
                <div className="flex gap-2">
                    <button
                        onClick={handleAdd}
                        className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 text-sm"
                    >
                        Add New Expense
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 text-sm"
                    >
                        {isSaving ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>

            {saveStatus && (
                <p className="text-sm mb-2 text-center text-green-500 dark:text-green-400">{saveStatus}</p>
            )}

            <table className="w-full text-sm border">
                <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                        <th className="p-2 text-left">Store ID</th>
                        <th className="p-2 text-left">Expense Type</th>
                        <th className="p-2 text-left">Amount ($)</th>
                        <th className="p-2 text-left">Recorded Date</th>
                        <th className="p-2 text-left">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {localData.map((row, index) => (
                        <tr key={index} className="border-t">
                            <td className="p-2">
                                <select
                                    className="w-full p-1 rounded border"
                                    value={row.dealerStoreId}
                                    onChange={(e) => handleChange(index, "dealerStoreId", e.target.value)}
                                >
                                    <option value="">Select Store</option>
                                    {storeOptions.map((store) => (
                                        <option key={store.storeId} value={store.storeId}>
                                            {store.storeId}
                                        </option>
                                    ))}
                                </select>
                            </td>
                            <td className="p-2">
                                <input
                                    list={`expense-type-options-${index}`}
                                    className="w-full p-1 rounded border"
                                    value={row.expenseType}
                                    onChange={(e) => handleChange(index, "expenseType", e.target.value)}
                                />
                                <datalist id={`expense-type-options-${index}`}>
                                    {expenseTypeOptions.map((option) => (
                                        <option key={option} value={option} />
                                    ))}
                                </datalist>
                            </td>
                            <td className="p-2">
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full p-1 rounded border"
                                    value={row.amount}
                                    onChange={(e) => handleChange(index, "amount", e.target.value)}
                                />
                            </td>
                            <td className="p-2 text-gray-500">{row.recordedDate ?? "—"}</td>
                            <td className="p-2">
                                <button
                                    className="text-red-500 hover:text-red-700 text-sm"
                                    onClick={() => handleDelete(index)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
