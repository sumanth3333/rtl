"use client";

import React from "react";

interface Transfer {
    id?: string;
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
    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse shadow-md rounded-lg overflow-hidden">
                <thead className="bg-gray-200 dark:bg-gray-800">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Device Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            IMEI
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Transferred To
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Transferred By
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Date
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-300 dark:divide-gray-700">
                    {transfers.length > 0 ? (
                        transfers.map((transfer) => (
                            <tr
                                key={transfer.id || transfer.imei || Math.random().toString()}
                                className="hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                            >
                                <td className="px-4 py-3 text-sm">{transfer.deviceName}</td>
                                <td className="px-4 py-3 text-sm">{transfer.imei}</td>
                                <td className="px-4 py-3 text-sm">{transfer.transferTo}</td>
                                <td className="px-4 py-3 text-sm">{transfer.transferedBy}</td>
                                <td className="px-4 py-3 text-sm">{transfer.date}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} className="px-4 py-4 text-center text-gray-500 dark:text-gray-400">
                                No pending transfers.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
