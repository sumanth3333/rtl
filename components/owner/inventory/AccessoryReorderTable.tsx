import { StoreReorderSummary } from "@/types/accessoriesReorderSummaryTypes";

interface ReorderTableProps {
    store: StoreReorderSummary;
}

export default function ReorderTable({ store }: ReorderTableProps) {
    return (
        <div className="mt-6 p-4 bg-white dark:bg-gray-900 shadow-lg rounded-lg">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {store.store.storeName}
            </h2>

            <div className="overflow-x-auto mt-4">
                <table className="w-full border-collapse border border-gray-300 dark:border-gray-700 text-sm md:text-base">
                    <thead>
                        <tr className="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-300">
                            <th className="p-3 text-left">Product Name</th>

                            <th className="p-3 text-center">Min Case Qty</th>
                            <th className="p-3 text-center">Min Glass Qty</th>

                            <th className="p-3 text-center">Current Case Qty</th>
                            <th className="p-3 text-center">Current Glass Qty</th>

                            <th className="p-3 text-center">Reorder Case Qty</th>
                            <th className="p-3 text-center">Reorder Glass Qty</th>

                        </tr>
                    </thead>
                    <tbody>
                        {store.inventory.map((item, index) => (
                            <tr key={index} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                                <td className="p-3">{item.productName}</td>
                                <td className="p-3 text-center">{item.minimumCaseQuantity}</td>
                                <td className="p-3 text-center">{item.minimumGlassQuantity}</td>
                                <td className="p-3 text-center">{item.currentCaseQuantity}</td>
                                <td className="p-3 text-center">{item.currentGlassQuantity}</td>
                                <td className="p-3 text-center text-red-500 font-semibold">
                                    {Math.max(0, item.minimumCaseQuantity - item.currentCaseQuantity)}
                                </td>
                                <td className="p-3 text-center text-red-500 font-semibold">
                                    {Math.max(0, item.minimumGlassQuantity - item.currentGlassQuantity)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
