"use client";

interface EodSummary {
    dealerStoreId: string;
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
        <div className="w-full p-4 bg-white dark:bg-gray-900 rounded-lg shadow-md">
            {/* ✅ Desktop View */}
            <div className="hidden md:block">
                <table className="w-full text-sm border-collapse border border-gray-300 dark:border-gray-700">
                    <thead className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-300 uppercase">
                        <tr>
                            <th className="p-3 text-left">Date</th>
                            <th className="p-3 text-left">Store</th>
                            <th className="p-3 text-left">Employee</th>
                            <th className="p-3 text-center">Boxes</th>
                            <th className="p-3 text-center">HSI</th>
                            <th className="p-3 text-center">Tablets</th>
                            <th className="p-3 text-center">Watches</th>
                            <th className="p-3 text-center">Accessories ($)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {eodList.map((eod, index) => (
                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                                <td className="p-3 font-semibold text-gray-900 dark:text-white">{eod.saleDate}</td>
                                <td className="p-3 text-gray-700 dark:text-gray-300">{eod.dealerStoreId}</td>
                                <td className="p-3 text-gray-700 dark:text-gray-300">{eod.employeeName}</td>
                                <td className="p-3 text-center font-semibold text-blue-600 dark:text-blue-400">{eod.boxesSold}</td>
                                <td className="p-3 text-center font-semibold text-green-600 dark:text-green-400">{eod.hsiSold}</td>
                                <td className="p-3 text-center font-semibold text-indigo-600 dark:text-indigo-400">{eod.tabletsSold}</td>
                                <td className="p-3 text-center font-semibold text-purple-600 dark:text-purple-400">{eod.watchesSold}</td>
                                <td className="p-3 text-center font-semibold text-yellow-600 dark:text-yellow-400">${eod.accessories}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ✅ Mobile View */}
            <div className="md:hidden flex flex-col gap-2">
                {eodList.map((eod, index) => (
                    <div
                        key={index}
                        className="p-3 bg-gray-50 dark:bg-gray-800 border-l-4 border-blue-500 dark:border-blue-400 rounded-md shadow-sm flex flex-col"
                    >
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>Date</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {eod.saleDate}
                            </span>
                        </div>

                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>Store</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {eod.dealerStoreId}
                            </span>
                        </div>

                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>Employee</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {eod.employeeName}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-2 text-xs text-gray-600 dark:text-gray-400">
                            <div className="flex justify-between bg-white dark:bg-gray-700 p-2 rounded-md shadow-sm">
                                <span>Boxes</span>
                                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                    {eod.boxesSold}
                                </span>
                            </div>

                            <div className="flex justify-between bg-white dark:bg-gray-700 p-2 rounded-md shadow-sm">
                                <span>HSI</span>
                                <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                    {eod.hsiSold}
                                </span>
                            </div>

                            <div className="flex justify-between bg-white dark:bg-gray-700 p-2 rounded-md shadow-sm">
                                <span>Tablets</span>
                                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                                    {eod.tabletsSold}
                                </span>
                            </div>

                            <div className="flex justify-between bg-white dark:bg-gray-700 p-2 rounded-md shadow-sm">
                                <span>Watches</span>
                                <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                                    {eod.watchesSold}
                                </span>
                            </div>

                            <div className="col-span-2 flex justify-between bg-white dark:bg-gray-700 p-2 rounded-md shadow-sm">
                                <span>Accessories ($)</span>
                                <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                                    ${eod.accessories}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
