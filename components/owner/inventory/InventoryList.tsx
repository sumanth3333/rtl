"use client";

interface InventoryTableProps {
    inventory: { id: number; productName: string; quantity: number }[];
}

export default function InventoryTable({ inventory }: InventoryTableProps) {
    return (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-md rounded-lg">
            <table className="w-full text-sm text-gray-900 dark:text-gray-200">
                <thead className="bg-gray-200 dark:bg-gray-700">
                    <tr>
                        <th className="p-3 text-left">Product</th>
                        <th className="p-3 text-center">Quantity</th>
                    </tr>
                </thead>
                <tbody>
                    {inventory.map((item) => (
                        <tr key={item.id} className="border-t border-gray-300 dark:border-gray-700">
                            <td className="p-3">{item.productName}</td>
                            <td className="p-3 text-center">{item.quantity}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
