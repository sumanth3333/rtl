"use client";

import { useState } from "react";
import { ReorderSummaryData } from "@/types/reorderSummaryTypes";
import TableHeader from "./TableHeader";

interface ReorderSummaryTableProps {
    data: ReorderSummaryData[];
}

export default function ReorderSummaryTable({ data }: ReorderSummaryTableProps) {
    const [sortedField, setSortedField] = useState<string | null>(null);
    const [ascending, setAscending] = useState<boolean>(true);

    const handleSort = (key: string) => {
        setSortedField(key);
        setAscending(sortedField === key ? !ascending : true);
    };

    const sortedData = data.map((storeData) => ({
        ...storeData,
        inventory: [...storeData.inventory].sort((a, b) => {
            if (!sortedField) {return 0;}
            const valA = a[sortedField as keyof typeof a];
            const valB = b[sortedField as keyof typeof b];

            if (typeof valA === "number" && typeof valB === "number") {
                return ascending ? valA - valB : valB - valA;
            }
            return ascending ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
        }),
    }));

    return (
        <div className="mt-6">
            {sortedData.map(({ store, inventory }) => (
                <div key={store.dealerStoreId} className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6">
                    {/* Store Header */}
                    <div className="p-4 bg-gray-200 dark:bg-gray-700 rounded-t-lg">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-200">{store.storeName}</h3>
                    </div>

                    {/* Responsive Table Container */}
                    <div className="overflow-x-auto">
                        <table className="w-full border border-gray-300 rounded-md">
                            <thead>
                                <TableHeader
                                    headers={[
                                        { key: "productName", label: "Product Name" },
                                        { key: "minimumQuantity", label: "Min Qty" },
                                        { key: "currentQuantity", label: "Current Qty" },
                                    ]}
                                    sortedField={sortedField}
                                    ascending={ascending}
                                    onSort={handleSort}
                                />
                            </thead>
                            <tbody>
                                {inventory.length > 0 ? (
                                    inventory.map((item) => (
                                        <tr
                                            key={item.productName}
                                            className={`border transition-all duration-200 ease-in-out ${item.currentQuantity < item.minimumQuantity
                                                    ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                                                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                                                }`}
                                        >
                                            <td className="border px-4 py-3">{item.productName}</td>
                                            <td className="border px-4 py-3 text-center">{item.minimumQuantity}</td>
                                            <td className="border px-4 py-3 text-center">{item.currentQuantity}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="text-center py-4 text-gray-500 dark:text-gray-300">
                                            No inventory data available.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    );
}
