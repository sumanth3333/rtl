"use client";

interface SoldDevice {
    soldTo: string;
    productName: string;
    imei: string;
    soldDate: string;
    soldPrice: number;
    soldBy: string;
    soldAt: string;
}

interface TableProps {
    soldDevices: SoldDevice[];
}

export default function PreviouslySoldDevicesTable({ soldDevices }: TableProps) {
    return (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 mt-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Previously Sold Devices
            </h2>
            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                    <thead className="bg-gray-700">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Sold To</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Device Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">IMEI</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Sold Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Sold Price</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Sold By</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Sold At</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                        {soldDevices.length > 0 ? (
                            soldDevices.map((device) => (
                                <tr key={device.imei} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{device.soldTo}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{device.productName}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{device.imei}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{device.soldDate}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">${device.soldPrice}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{device.soldBy}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{device.soldAt}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="px-4 py-3 text-center text-gray-500">
                                    No sold devices available.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
