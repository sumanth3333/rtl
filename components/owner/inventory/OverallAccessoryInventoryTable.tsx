"use client";

import { OverallProductInventory } from "@/types/currentAccessoryTypes";


interface OverallInventoryTableProps {
    data: OverallProductInventory[];
}

export default function OverallInventoryTable({ data }: OverallInventoryTableProps) {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-4 mt-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                📦 Overall Accessories Summary
            </h3>

            <div className="overflow-x-auto mt-2">
                <table className="w-full text-sm md:text-base border-collapse border border-gray-300 dark:border-gray-700">
                    <thead>
                        <tr className="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-300">
                            <th className="p-3 text-left">Product</th>
                            <th className="p-3 text-center">Total Case Quantity</th>
                            <th className="p-3 text-center">Total Glass Quantity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr
                                key={index}
                                className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                            >
                                <td className="p-3">{item.productName}</td>
                                <td className="p-3 text-center">{item.caseQuantity}</td>
                                <td className="p-3 text-center">{item.glassQuantity}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
