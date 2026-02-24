import { Threshold } from "@/types/companyTypes";

interface CommissionTableProps {
    thresholds: Threshold[];
    setThresholds: (updatedThresholds: Threshold[]) => void;
}

export default function CommissionTable({ thresholds, setThresholds }: CommissionTableProps) {
    // ✅ Handle threshold updates
    const handleUpdate = (index: number, field: keyof Threshold, value: string | number) => {
        setThresholds(
            thresholds.map((t, i) => (i === index ? { ...t, [field]: value || 0 } : t)) // Ensure no NaN values
        );
    };

    // ✅ Remove a threshold row
    const handleRemove = (index: number) => {
        setThresholds(thresholds.filter((_, i) => i !== index));
    };

    const handleAdd = (itemType: Threshold["itemType"]) => {
        setThresholds([
            ...thresholds,
            { thresholdId: Date.now(), itemType, minimumThreshold: 0, threshold: 30, payAmount: 0 }, // ✅ Use Date.now() for a temporary unique ID
        ]);
    };


    return (
        <div className="mt-6">

            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-3">
                Commission Structure
            </h3>

            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                <table className="w-full text-sm md:text-base">
                    <thead>
                        <tr className="text-gray-700 dark:text-gray-300">
                            <th className="p-2 text-left">Item Type</th>
                            <th className="p-2 text-center">Min</th>
                            <th className="p-2 text-center">Max</th>
                            <th className="p-2 text-center">Pay Amount ($)</th>
                            <th className="p-2 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {thresholds.map((threshold, index) => (
                            <tr key={index} className="border-t border-gray-300 dark:border-gray-700">
                                {/* ✅ Item Type Dropdown */}
                                <td className="p-2">
                                    <select
                                        className="w-full p-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white"
                                        value={threshold.itemType}
                                        onChange={(e) => handleUpdate(index, "itemType", e.target.value)}
                                    >
                                        <option value="Boxes">Boxes</option>
                                        <option value="Upgrades">Upgrades</option>
                                        <option value="Migrations">Migrations</option>
                                        <option value="Tablets">BTS</option>
                                        <option value="HSI">HSI</option>
                                        <option value="Watches">FreeLines</option>
                                    </select>
                                </td>

                                {/* ✅ Min Input */}
                                <td className="p-2 text-center">
                                    <input
                                        type="number"
                                        className="w-16 p-1 text-center border rounded-md bg-gray-50 dark:bg-gray-900 dark:text-white"
                                        value={threshold.minimumThreshold ?? 0} // Default to 0
                                        min={0}
                                        onChange={(e) => handleUpdate(index, "minimumThreshold", Number(e.target.value) || 0)}
                                    />
                                </td>

                                {/* ✅ Max Input */}
                                <td className="p-2 text-center">
                                    <input
                                        type="number"
                                        className="w-16 p-1 text-center border rounded-md bg-gray-50 dark:bg-gray-900 dark:text-white"
                                        value={threshold.threshold ?? ""}
                                        min={threshold.minimumThreshold + 1}
                                        onChange={(e) => handleUpdate(index, "threshold", Number(e.target.value) || 0)}
                                    />
                                </td>

                                {/* ✅ Pay Amount Input */}
                                <td className="p-2 text-center">
                                    <input
                                        type="number"
                                        className="w-16 p-1 text-center border rounded-md bg-gray-50 dark:bg-gray-900 dark:text-white"
                                        value={threshold.payAmount ?? 0} // Prevent NaN
                                        onChange={(e) => handleUpdate(index, "payAmount", Number(e.target.value) || 0)}
                                    />
                                </td>

                                {/* ✅ Remove Button */}
                                <td className="p-2 text-center">
                                    <button
                                        onClick={() => handleRemove(index)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        ❌ Remove
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* ✅ Add New Threshold Buttons */}
                <div className="mt-4 flex flex-wrap justify-end gap-3">
                    <button
                        onClick={() => handleAdd("Boxes")}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        ➕ Add Box Threshold
                    </button>
                    <button
                        onClick={() => handleAdd("Upgrades")}
                        className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600"
                    >
                        ➕ Add Upgrade Threshold
                    </button>
                    <button
                        onClick={() => handleAdd("Migrations")}
                        className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600"
                    >
                        ➕ Add Migrations Threshold
                    </button>
                    <button
                        onClick={() => handleAdd("Tablets")}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                        ➕ Add BTS Threshold
                    </button>
                    <button
                        onClick={() => handleAdd("HSI")}
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    >
                        ➕ Add HSI Threshold
                    </button>
                    <button
                        onClick={() => handleAdd("Watches")}
                        className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                    >
                        ➕ Add FreeLines Threshold
                    </button>
                </div>
            </div>
        </div>
    );
}
