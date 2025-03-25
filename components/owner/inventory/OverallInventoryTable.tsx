"use client";

interface OverallInventoryItem {
    productName: string;
    currentQuantity: number;
}

interface OverallInventoryTableProps {
    data: OverallInventoryItem[];
    stockValue: number;
}

export default function OverallInventoryTable({ data, stockValue }: OverallInventoryTableProps) {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-4 mt-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                📦 Overall Inventory Summary
            </h3>

            <p className="text-gray-600 dark:text-gray-300 mb-4">
                Total Stock Value: <strong>${stockValue.toFixed(2)}</strong>
            </p>

            <div className="overflow-x-auto mt-2">
                <table className="w-full text-sm md:text-base border-collapse border border-gray-300 dark:border-gray-700">
                    <thead>
                        <tr className="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-300">
                            <th className="p-3 text-left">Product</th>
                            <th className="p-3 text-center">Total Quantity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr
                                key={index}
                                className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                            >
                                <td className="p-3">{item.productName}</td>
                                <td className="p-3 text-center">{item.currentQuantity}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
