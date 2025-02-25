"use client";

import { useState } from "react";
import TableRow from "./TableRow";
import { Device, Store } from "@/types/upgradePhoneTypes";

interface AvailableDevicesTableProps {
    devices: Device[];
    storeIds: Store[];
    selectedStore: string | null;
}

export default function AvailableDevicesTable({ devices, storeIds, selectedStore }: AvailableDevicesTableProps) {
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    console.log(`available devices are ${devices}`);

    return (
        <div className="mt-6">
            <table className="responsive-table min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                        <th className="px-4 py-2 text-xs font-semibold text-gray-900 dark:text-white whitespace-nowrap">Device Name</th>
                        <th className="px-4 py-2 text-xs font-semibold text-gray-900 dark:text-white whitespace-nowrap">IMEI</th>
                        <th className="px-4 py-2 text-xs font-semibold text-gray-900 dark:text-white whitespace-nowrap">Phone Number</th>
                        <th className="px-4 py-2 text-xs font-semibold text-gray-900 dark:text-white whitespace-nowrap">Activation Date</th>
                        <th className="px-4 py-2 text-xs font-semibold text-gray-900 dark:text-white whitespace-nowrap">Days Old</th>
                        <th className="px-4 py-2 text-xs font-semibold text-gray-900 dark:text-white whitespace-nowrap">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {devices.length > 0 ? (
                        devices.map((device) => (
                            <TableRow
                                key={device.id}
                                device={device}
                                setExpandedRow={setExpandedRow}
                                expandedRow={expandedRow}
                                storeIds={storeIds}
                                selectedStore={selectedStore}
                            />
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6} className="px-4 py-2 text-center text-gray-500">
                                No devices available.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Responsive Table Styles */}
            <style jsx global>{`
                @media (max-width: 640px) {
                    .responsive-table,
                    .responsive-table thead,
                    .responsive-table tbody,
                    .responsive-table th,
                    .responsive-table td,
                    .responsive-table tr {
                        display: block;
                    }
                    .responsive-table thead tr {
                        position: absolute;
                        top: -9999px;
                        left: -9999px;
                    }
                    .responsive-table tr {
                        margin-bottom: 1rem;
                        border: 1px solid #e5e7eb;
                        border-radius: 0.5rem;
                        overflow: hidden;
                    }
                    .responsive-table td {
                        border: none;
                        border-bottom: 1px solid #e5e7eb;
                        position: relative;
                        padding-left: 50%;
                        text-align: left;
                        font-size: 0.875rem;
                        color: #374151;
                    }
                    .responsive-table td:before {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 45%;
                        padding-left: 0.5rem;
                        white-space: nowrap;
                        font-weight: 600;
                        font-size: 0.75rem;
                        color: #111827;
                    }
                    .responsive-table td:nth-of-type(1):before { content: "Device Name"; }
                    .responsive-table td:nth-of-type(2):before { content: "IMEI"; }
                    .responsive-table td:nth-of-type(3):before { content: "Phone Number"; }
                    .responsive-table td:nth-of-type(4):before { content: "Activation Date"; }
                    .responsive-table td:nth-of-type(5):before { content: "Days Old"; }
                    .responsive-table td:nth-of-type(6):before { content: "Actions"; }
                }
            `}</style>
        </div>
    );
}
