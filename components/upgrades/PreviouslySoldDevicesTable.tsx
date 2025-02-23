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
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mt-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Previously Sold Devices</h2>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-700 text-white">
                            <th className="border px-4 py-2">Sold To</th>
                            <th className="border px-4 py-2">Device Name</th>
                            <th className="border px-4 py-2">IMEI</th>
                            <th className="border px-4 py-2">Sold Date</th>
                            <th className="border px-4 py-2">Sold Price</th>
                            <th className="border px-4 py-2">Sold By</th>
                            <th className="border px-4 py-2">Sold At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {soldDevices.length > 0 ? (
                            soldDevices.map((device) => (
                                <tr key={device.imei} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="border px-4 py-2">{device.soldTo}</td>
                                    <td className="border px-4 py-2">{device.productName}</td>
                                    <td className="border px-4 py-2">{device.imei}</td>
                                    <td className="border px-4 py-2">{device.soldDate}</td>
                                    <td className="border px-4 py-2">${device.soldPrice}</td>
                                    <td className="border px-4 py-2">{device.soldBy}</td>
                                    <td className="border px-4 py-2">{device.soldAt}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="text-center py-4 text-gray-500">
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
