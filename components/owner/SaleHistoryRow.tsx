import { SaleHistory } from "@/types/cashCollectionTypes";

interface SaleHistoryRowProps {
    sale: SaleHistory;
}

export default function SaleHistoryRow({ sale }: SaleHistoryRowProps) {
    return (
        <tr className="hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100">
            <td className="border px-4 py-3">{sale.employeeName}</td>
            <td className="border px-4 py-3">{sale.saleDate}</td>
            <td className="border px-4 py-3 text-gray-600 dark:text-gray-400">${sale.systemAccessories.toFixed(2)}</td>
            <td className="border px-4 py-3 text-purple-600 dark:text-purple-400 font-bold">${sale.accessories.toFixed(2)}</td>
            <td className="border px-4 py-3 text-gray-600 dark:text-gray-400">${sale.systemCash.toFixed(2)}</td>
            <td className="border px-4 py-3 text-green-600 dark:text-green-400 font-bold">${sale.actualCash.toFixed(2)}</td>
            <td className="border px-4 py-3 text-gray-600 dark:text-gray-400">${sale.systemCard.toFixed(2)}</td>
            <td className="border px-4 py-3 text-blue-600 dark:text-blue-400 font-bold">${sale.actualCard.toFixed(2)}</td>
            <td className="border px-4 py-3 text-red-600 dark:text-red-400">${sale.cashExpense.toFixed(2)}</td>
            <td className="border px-4 py-3">{sale.expenseReason}</td>
        </tr>
    );
}
