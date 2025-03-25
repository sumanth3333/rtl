interface OverallReorderTableProps {
    inventory: { productName: string; currentQuantity: number }[];
    totalValue: number;
}

export default function OverallReorderTable({ inventory, totalValue }: OverallReorderTableProps) {
    return (
        <div className="mt-6 p-4 bg-white dark:bg-gray-900 shadow-lg rounded-lg">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Overall Reorder Summary
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
                Total Estimated Value: <span className="font-bold text-green-600 dark:text-green-400">${totalValue.toFixed(2)}</span>
            </p>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 dark:border-gray-700 text-sm md:text-base">
                    <thead>
                        <tr className="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-300">
                            <th className="p-3 text-left">Product Name</th>
                            <th className="p-3 text-center">Current Qty</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inventory.map((item, index) => (
                            <tr key={index} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
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
