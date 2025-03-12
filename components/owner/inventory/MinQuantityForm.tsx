"use client";

import { useState } from "react";

interface MinQuantityFormProps {
    inventory: { id: number; productName: string; quantity: number; minQuantity?: number }[];
}

export default function MinQuantityForm({ inventory }: MinQuantityFormProps) {
    const [minQuantities, setMinQuantities] = useState<{ [key: number]: number }>(
        inventory.reduce((acc, item) => ({ ...acc, [item.id]: item.minQuantity || 0 }), {} as { [key: number]: number })
    );


    const handleUpdate = (id: number, value: number) => {
        setMinQuantities((prev) => ({
            ...prev,
            [id]: value < 0 ? 0 : value, // Ensure no negative values
        }));
    };

    const handleSave = async () => {
        console.log("Saving min quantities:", minQuantities);
        // Here you can call an API to save the min quantity settings
    };

    return (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
            <table className="w-full text-sm text-gray-900 dark:text-gray-200">
                <thead className="bg-gray-200 dark:bg-gray-700">
                    <tr>
                        <th className="p-3 text-left">Product</th>
                        <th className="p-3 text-center">Current Qty</th>
                        <th className="p-3 text-center">Min Qty</th>
                    </tr>
                </thead>
                <tbody>
                    {inventory.map((item) => (
                        <tr key={item.id} className="border-t border-gray-300 dark:border-gray-700">
                            <td className="p-3">{item.productName}</td>
                            <td className="p-3 text-center">{item.quantity}</td>
                            <td className="p-3 text-center">
                                <input
                                    type="number"
                                    className="w-16 p-1 text-center border rounded-md bg-gray-50 dark:bg-gray-900 dark:text-white"
                                    value={minQuantities[item.id]}
                                    onChange={(e) => handleUpdate(item.id, Number(e.target.value))}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="mt-4 flex justify-end">
                <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                    Save Min Quantities
                </button>
            </div>
        </div>
    );
}
