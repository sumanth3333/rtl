"use client";

interface EodSummary {
    dealerStoreId: string
    employeeName: string;
    boxesSold: string;
    accessories: string;
    hsiSold: string;
    tabletsSold: string;
    watchesSold: string;
    saleDate: string;
}

interface LatestEodListProps {
    eodList: EodSummary[];
}

export default function LatestEodList({ eodList }: LatestEodListProps) {
    return (
        <div className="w-full overflow-x-auto md:overflow-visible">
            <table className="w-full border-collapse text-sm text-left bg-white dark:bg-gray-900 shadow-lg rounded-lg overflow-hidden">
                <thead className="bg-gradient-to-r from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900 text-gray-700 dark:text-gray-300 text-sm md:text-base uppercase">
                    <tr>
                        <th className="px-6 py-4 text-left font-semibold">Sale Date</th>
                        <th className="px-6 py-4 text-left font-semibold">Store ID</th>
                        <th className="px-6 py-4 text-left font-semibold">Employee Name</th>
                        <th className="px-6 py-4 text-left font-semibold">Boxes</th>
                        <th className="px-6 py-4 text-left font-semibold">HSI</th>
                        <th className="px-6 py-4 text-left font-semibold">Tablets</th>
                        <th className="px-6 py-4 text-left font-semibold">Watches</th>
                        <th className="px-6 py-4 text-left font-semibold">Total Accessories </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {eodList.map((eod, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300">
                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{eod.saleDate}</td>
                            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{eod.dealerStoreId}</td>
                            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{eod.employeeName}</td>
                            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{eod.boxesSold}</td>
                            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{eod.hsiSold}</td>
                            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{eod.tabletsSold}</td>
                            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{eod.watchesSold}</td>
                            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{eod.accessories}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}