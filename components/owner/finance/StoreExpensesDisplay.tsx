"use client";

import { useState } from "react";
import AddStoreExpenseForm from "./AddStoreExpenseForm";

interface StoreExpense {
    dealerStoreId: string;
    paidFor: string;
    amount: number;
    month: string;
    paidDate: string;
    expenseRecordedDate: string;
}

interface StoreExpensesDisplayProps {
    expenses: StoreExpense[];
    onAdd: (expense: StoreExpense) => void;
    onSave: (expenses: StoreExpense[]) => Promise<void>; // 👈 update here
}

export default function StoreExpensesDisplay({ expenses, onAdd, onSave }: StoreExpensesDisplayProps) {
    const [showForm, setShowForm] = useState(false);

    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

    return (
        <div className="mt-10">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">🏪 Store Expenses</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowForm(prev => !prev)}
                        className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 text-sm"
                    >
                        {showForm ? "Cancel" : "Add New Expense"}
                    </button>
                    <button
                        onClick={() => onSave(expenses)}
                        className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 text-sm"
                    >
                        Save
                    </button>

                </div>
            </div>

            {showForm && <AddStoreExpenseForm onAdd={onAdd} />}

            <div className="overflow-x-auto">
                <table className="min-w-full border text-sm mt-4 rounded-md overflow-hidden">
                    <thead className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100">
                        <tr>
                            <th className="px-4 py-2 text-left">Store ID</th>
                            <th className="px-4 py-2 text-left">Paid For</th>
                            <th className="px-4 py-2 text-left">Amount</th>
                            <th className="px-4 py-2 text-left">Month</th>
                            <th className="px-4 py-2 text-left">Paid Date</th>
                            <th className="px-4 py-2 text-left">Recorded Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-700">
                        {expenses.map((entry, idx) => (
                            <tr key={idx} className="bg-white dark:bg-gray-900">
                                <td className="px-4 py-2">{entry.dealerStoreId}</td>
                                <td className="px-4 py-2">{entry.paidFor}</td>
                                <td className="px-4 py-2">${entry.amount.toFixed(2)}</td>
                                <td className="px-4 py-2">{entry.month}</td>
                                <td className="px-4 py-2">{entry.paidDate}</td>
                                <td className="px-4 py-2">{entry.expenseRecordedDate}</td>
                            </tr>
                        ))}
                        <tr className="font-semibold bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white">
                            <td colSpan={2} className="px-4 py-2 text-right">Total</td>
                            <td className="px-4 py-2">${totalAmount.toFixed(2)}</td>
                            <td colSpan={3}></td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>
    );
}
