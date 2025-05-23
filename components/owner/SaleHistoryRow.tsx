import { SaleHistory } from "@/types/cashCollectionTypes";
import { useState } from "react";
import apiClient from "@/services/api/apiClient";
import { toast } from "react-toastify";

interface SaleHistoryRowProps {
    sale: SaleHistory;
    store: string;
}

export default function SaleHistoryRow({ sale, store }: SaleHistoryRowProps) {
    const [loading, setLoading] = useState(false);

    const showAddButton = sale.cashExpense > 0 && sale.expenseReason?.trim() !== "";

    const handleAddExpense = async () => {
        const payload = {
            dealerStoreId: store,
            expenses: [
                {
                    paidFor: sale.expenseReason,
                    amount: sale.cashExpense,
                    month: sale.saleDate.slice(0, 7),
                    paidDate: sale.saleDate
                }
            ]
        };

        try {
            setLoading(true);
            await apiClient.post("/expense/saveStoreExpenses", payload);
            toast.success("Expense added successfully.");
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to add expense.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <tr className="hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 text-xs sm:text-sm md:text-base">
            <td className="border px-2 sm:px-3 md:px-4 py-1 sm:py-2 md:py-3">{sale.employeeName}</td>
            <td className="border px-2 sm:px-3 md:px-4 py-1 sm:py-2 md:py-3 whitespace-nowrap">
                {sale.saleDate.slice(5)} <span className="text-xs text-gray-500">({sale.saleDate.slice(0, 4)})</span>
            </td>
            <td className="border px-2 sm:px-3 md:px-4 text-gray-600 dark:text-gray-400">${sale.systemAccessories.toFixed(2)}</td>
            <td className="border px-2 sm:px-3 md:px-4 text-purple-600 dark:text-purple-400 font-bold">${sale.accessories.toFixed(2)}</td>
            <td className="border px-2 sm:px-3 md:px-4 text-gray-600 dark:text-gray-400">${sale.systemCash.toFixed(2)}</td>
            <td className="border px-2 sm:px-3 md:px-4 text-green-600 dark:text-green-400 font-bold">${sale.actualCash.toFixed(2)}</td>
            <td className="border px-2 sm:px-3 md:px-4 text-gray-600 dark:text-gray-400">${sale.systemCard.toFixed(2)}</td>
            <td className="border px-2 sm:px-3 md:px-4 text-blue-600 dark:text-blue-400 font-bold">${sale.actualCard.toFixed(2)}</td>
            <td className="border px-2 sm:px-3 md:px-4 text-red-600 dark:text-red-400">${sale.cashExpense.toFixed(2)}</td>
            <td className="border px-2 sm:px-3 md:px-4">{sale.expenseReason}</td>
            <td className="border px-2 sm:px-3 md:px-4">
                {showAddButton && (
                    <button
                        onClick={handleAddExpense}
                        disabled={loading}
                        className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? "Adding..." : "Add to Expense"}
                    </button>
                )}
            </td>
        </tr>
    );
}
