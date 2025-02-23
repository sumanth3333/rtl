import React from "react";

interface Transfer {
    id?: string; // Made optional in case it's missing
    deviceName: string;
    imei: string;
    transferTo: string;
    transferedBy: string;
    date: string;
}

interface TransferListProps {
    transfers: Transfer[];
}

export default function TransferList({ transfers }: TransferListProps) {
    console.log(transfers);
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <table className="w-full border border-gray-300 rounded-md">
                <thead>
                    <tr className="bg-gray-700 text-white text-left">
                        <th className="border px-4 py-3">Device Name</th>
                        <th className="border px-4 py-3">IMEI</th>
                        <th className="border px-4 py-3">Transferred To</th>
                        <th className="border px-4 py-3">Transferred By</th>
                        <th className="border px-4 py-3">Date</th>
                    </tr>
                </thead>
                <tbody>
                    {transfers.length > 0 ? (
                        transfers.map((transfer) => (
                            <tr
                                key={transfer.id || transfer.imei || Math.random().toString()} // Ensuring unique key
                                className="hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-300"
                            >
                                <td className="border px-4 py-3">{transfer.deviceName}</td>
                                <td className="border px-4 py-3">{transfer.imei}</td>
                                <td className="border px-4 py-3">{transfer.transferTo}</td>
                                <td className="border px-4 py-3">{transfer.transferedBy}</td>
                                <td className="border px-4 py-3">{transfer.date}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} className="text-center py-6 text-gray-500">
                                No pending transfers.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
