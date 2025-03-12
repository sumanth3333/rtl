import { StoreReorderSummary } from "@/types/reorderSummaryTypes";

interface ReorderTableProps {
    store: StoreReorderSummary;
}

export default function ReorderTable({ store }: ReorderTableProps) {
    return (
        <div className="mt-6 p-4 bg-white dark:bg-gray-900 shadow-lg rounded-lg">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {store.store.storeName}
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
                Estimated Reorder Value:{" "}
                <span className="font-bold text-green-600 dark:text-green-400">${store.estimatedReorderValue.toFixed(2)}</span>
            </p>

            <div className="overflow-x-auto mt-4">
                <table className="w-full border-collapse border border-gray-300 dark:border-gray-700 text-sm md:text-base">
                    <thead>
                        <tr className="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-300">
                            <th className="p-3 text-left">Product Name</th>
                            <th className="p-3 text-center">Min Qty</th>
                            <th className="p-3 text-center">Current Qty</th>
                            <th className="p-3 text-center">Reorder Qty</th>
                        </tr>
                    </thead>
                    <tbody>
                        {store.inventory.map((item, index) => (
                            <tr key={index} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                                <td className="p-3">{item.productName}</td>
                                <td className="p-3 text-center">{item.minimumQuantity}</td>
                                <td className="p-3 text-center">{item.currentQuantity}</td>
                                <td className="p-3 text-center text-red-500 font-semibold">
                                    {Math.max(0, item.minimumQuantity - item.currentQuantity)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
