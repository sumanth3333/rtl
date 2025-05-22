"use client";

import { useState } from "react";
import { PencilIcon, CheckIcon } from "@heroicons/react/24/solid";

interface LegalExpense {
    type: string;
    amount: number;
}

interface LegalExpensesTableProps {
    data: LegalExpense[];
    onUpdate: (updated: LegalExpense[]) => void;
    onSave: (updated: LegalExpense[]) => Promise<void>;
}

export default function LegalExpensesTable({
    data,
    onUpdate,
    onSave,
}: LegalExpensesTableProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [localData, setLocalData] = useState<LegalExpense[]>(data);

    const handleAmountChange = (index: number, value: number) => {
        const updated = [...localData];
        updated[index].amount = value;
        setLocalData(updated);
        onUpdate(updated);
    };

    const handleSave = async () => {
        await onSave(localData);
        setIsEditing(false);
    };

    return (
        <div className="mt-8">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">⚖️ Legal Expenses</h2>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-sm flex items-center gap-1 text-blue-600 hover:underline"
                    >
                        <PencilIcon className="w-4 h-4" />
                        Edit
                    </button>
                ) : (
                    <button
                        onClick={handleSave}
                        className="text-sm flex items-center gap-1 text-green-600 hover:underline"
                    >
                        <CheckIcon className="w-4 h-4" />
                        Save
                    </button>
                )}
            </div>

            <table className="w-full text-sm border rounded-md overflow-hidden">
                <thead className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100">
                    <tr>
                        <th className="px-4 py-2 text-left">Type</th>
                        <th className="px-4 py-2 text-left">Amount ($)</th>
                    </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-700">
                    {localData.map((item, index) => (
                        <tr key={index} className="bg-white dark:bg-gray-900">
                            <td className="px-4 py-2 font-medium">{item.type}</td>
                            <td className="px-4 py-2">
                                {isEditing ? (
                                    <input
                                        type="number"
                                        value={item.amount}
                                        step="0.01"
                                        onChange={(e) =>
                                            handleAmountChange(index, parseFloat(e.target.value))
                                        }
                                        className="w-24 px-2 py-1 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                                    />
                                ) : (
                                    `$${item.amount.toFixed(2)}`
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
