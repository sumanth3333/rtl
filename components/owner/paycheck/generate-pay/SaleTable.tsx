interface SalesTableProps {
    sales: any[];
}

export default function SalesTable({ sales }: SalesTableProps) {
    return (
        <div className="mt-4">
            <h4 className="text-md font-medium">Sales Transactions</h4>
            <table className="w-full text-sm border-collapse border border-gray-300 dark:border-gray-700 mt-2">
                <thead>
                    <tr className="bg-gray-200 dark:bg-gray-800">
                        <th className="p-3">Sale Date</th>
                        <th className="p-3">Store</th>
                        <th className="p-3">Boxes Sold</th>
                        <th className="p-3">Accessories ($)</th>
                    </tr>
                </thead>
                <tbody>
                    {sales.map((sale) => (
                        <tr key={sale.saleId} className="border-b border-gray-300">
                            <td className="p-3">{sale.saleDate}</td>
                            <td className="p-3">{sale.store.storeName}</td>
                            <td className="p-3 text-center">{sale.boxesSold}</td>
                            <td className="p-3 text-center">${sale.accessories.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
