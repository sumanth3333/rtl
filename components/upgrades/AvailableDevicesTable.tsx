"use client";

import { useState } from "react";
import TableRow from "./TableRow";
import { Device, Store } from "@/types/upgradePhoneTypes";

interface AvailableDevicesTableProps {
    devices: Device[];
    storeIds: Store[];
}

export default function AvailableDevicesTable({ devices, storeIds }: AvailableDevicesTableProps) {
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    console.log(`available devices are ${devices}`);
    return (
        <div className="bg-white dark:bg-gray-900 shadow-lg rounded-lg p-6 mt-6">
            <table className="w-full border border-gray-300 dark:border-gray-700 rounded-lg">
                <thead className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">
                    <tr>
                        <th className="p-4">Device Name</th>
                        <th className="p-4">IMEI</th>
                        <th className="p-4">Phone Number</th>
                        <th className="p-4">Activation Date</th>
                        <th className="p-4">Days Old</th>
                        <th className="p-4">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {devices.length > 0 ? (
                        devices.map((device) => (
                            <TableRow key={device.id} device={device} setExpandedRow={setExpandedRow} expandedRow={expandedRow} storeIds={storeIds} />
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6} className="p-4 text-center text-gray-500">No devices available.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
