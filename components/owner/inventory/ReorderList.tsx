"use client";

interface ReorderListProps {
    inventory: { id: number; productName: string; quantity: number; minQuantity?: number }[];
}

export default function ReorderList({ inventory }: ReorderListProps) {
    const itemsToReorder = inventory.filter((item) => item.quantity < (item.minQuantity || 0));

    return (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
            {itemsToReorder.length === 0 ? (
                <p className="text-green-500">✅ All inventory levels are above the minimum threshold.</p>
            ) : (
                <>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-3">🔄 Reorder Needed</h3>
                    <table className="w-full text-sm text-gray-900 dark:text-gray-200">
                        <thead className="bg-gray-200 dark:bg-gray-700">
                            <tr>
                                <th className="p-3 text-left">Product</th>
                                <th className="p-3 text-center">Current Qty</th>
                                <th className="p-3 text-center">Min Qty</th>
                                <th className="p-3 text-center">Needs Reorder?</th>
                            </tr>
                        </thead>
                        <tbody>
                            {itemsToReorder.map((item) => (
                                <tr key={item.id} className="border-t border-gray-300 dark:border-gray-700">
                                    <td className="p-3">{item.productName}</td>
                                    <td className="p-3 text-center">{item.quantity}</td>
                                    <td className="p-3 text-center">{item.minQuantity}</td>
                                    <td className="p-3 text-center text-red-500">🚨 Yes</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}
        </div>
    );
}
