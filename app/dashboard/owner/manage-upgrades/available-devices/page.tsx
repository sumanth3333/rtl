"use client";

import { useEffect, useState } from "react";
import { Device, Store } from "@/types/upgradePhoneTypes";
import apiClient from "@/services/api/apiClient";
import { useOwner } from "@/hooks/useOwner";

export default function OwnerAvailableDevicesPage() {
    const [devices, setDevices] = useState<(Device & { storeName: string })[]>([]);
    const [sortConfig, setSortConfig] = useState<{ key: "productName" | "daysOld"; direction: "asc" | "desc" }>(
        {
            key: "productName",
            direction: "asc",
        }
    );
    const { companyName } = useOwner();

    useEffect(() => {
        if (!companyName) {
            return;
        }
        const fetchDevices = async () => {
            try {
                const res = await apiClient.get(`/company/viewUpgradePhones`, {
                    params: { companyName }
                });
                const data = res.data;

                // Attach store name to each device
                const allDevices = data.flatMap((entry: { store: Store; products: Device[] }) =>
                    entry.products.map((product) => ({
                        ...product,
                        storeName: entry.store.storeName,
                    }))
                );

                setDevices(allDevices);
            } catch (err) {
                console.error("❌ Failed to fetch devices:", err);
            }
        };

        fetchDevices();
    }, [companyName]);

    const handleSort = (key: "productName" | "daysOld") => {
        setSortConfig((prev) => {
            if (prev.key === key) {
                return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
            }
            return { key, direction: "asc" };
        });
    };

    const sortedDevices = [...devices].sort((a, b) => {
        const { key, direction } = sortConfig;
        if (key === "productName") {
            const result = a.productName.localeCompare(b.productName);
            return direction === "asc" ? result : -result;
        }
        const result = (a.daysOld ?? 0) - (b.daysOld ?? 0);
        return direction === "asc" ? result : -result;
    });

    const renderSortIndicator = (key: "productName" | "daysOld") => {
        if (sortConfig.key !== key) { return "" };
        return sortConfig.direction === "asc" ? "▲" : "▼";
    };

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-8 sm:px-8">
            <h1 className="text-3xl font-bold text-center mb-6">📱 Available Upgrade Devices</h1>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse rounded-md overflow-hidden">
                    <thead className="bg-gray-200 dark:bg-gray-800 text-left">
                        <tr>
                            <th className="p-3">Store</th>
                            <th
                                className="p-3 cursor-pointer select-none"
                                onClick={() => handleSort("productName")}
                                title="Sort by device name"
                            >
                                Device Name {renderSortIndicator("productName")}
                            </th>
                            <th className="p-3">IMEI</th>
                            <th className="p-3">Phone #</th>
                            <th className="p-3">Activation Date</th>
                            <th
                                className="p-3 cursor-pointer select-none"
                                onClick={() => handleSort("daysOld")}
                                title="Sort by days old"
                            >
                                Days Old {renderSortIndicator("daysOld")}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedDevices.length > 0 ? (
                            sortedDevices.map((device) => (
                                <tr
                                    key={device.imei}
                                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                                >
                                    <td className="p-3 font-medium text-blue-600 dark:text-blue-400">{device.storeName}</td>
                                    <td className="p-3">{device.productName}</td>
                                    <td className="p-3">{device.imei}</td>
                                    <td className="p-3">{device.phoneNumber}</td>
                                    <td className="p-3">{device.activationDate}</td>
                                    <td className="p-3">{device.daysOld}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="p-4 text-center text-gray-500">
                                    No devices available.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </main>
    );
}
