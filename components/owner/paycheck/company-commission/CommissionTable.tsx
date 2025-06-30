import { useState } from "react";
import { Threshold } from "@/types/companyTypes";

interface CommissionTableProps {
    thresholds: Threshold[];
    setThresholds: (updatedThresholds: Threshold[]) => void;
}

export default function CommissionTable({ thresholds, setThresholds }: CommissionTableProps) {
    // ✅ State to track whether Tablets, HSI, and Watches are included in Box count
    const [includeUpgrades, setIncludeUpgrades] = useState(true);
    const [includeTablet, setIncludeTablet] = useState(false);
    const [includeHSI, setIncludeHSI] = useState(true);
    const [includeMigrations, setIncludeMigrations] = useState(false);
    const [includeWatch, setIncludeWatch] = useState(false);

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

    const handleAdd = (itemType: "Boxes" | "Upgrades" | "Tablets" | "Watches" | "HSI" | "Migrations") => {
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

            {/* ✅ Pre-Selection Questions */}
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4">
                <h4 className="text-md font-semibold text-gray-900 dark:text-gray-300 mb-2">Include in Box Count?</h4>

                {/* Include Upgrades in Box Count */}
                <div className="flex items-center gap-4 mb-2">
                    <label className="text-gray-800 dark:text-gray-200">Upgrades:</label>
                    <select
                        className="p-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white"
                        value={includeUpgrades ? "yes" : "no"}
                        onChange={(e) => setIncludeUpgrades(e.target.value === "yes")}
                    >
                        <option value="yes">Yes</option>
                        <option value="no">No (Set Custom $/Upgrade)</option>
                    </select>
                </div>

                {/* Include Migrations in Box Count */}
                <div className="flex items-center gap-4 mb-2">
                    <label className="text-gray-800 dark:text-gray-200">Migrations:</label>
                    <select
                        className="p-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white"
                        value={includeMigrations ? "yes" : "no"}
                        onChange={(e) => setIncludeMigrations(e.target.value === "yes")}
                    >
                        <option value="yes">Yes</option>
                        <option value="no">No (Set Custom $/Migration)</option>
                    </select>
                </div>

                {/* Include Tablets in Box Count */}
                <div className="flex items-center gap-4 mb-2">
                    <label className="text-gray-800 dark:text-gray-200">Tablets:</label>
                    <select
                        className="p-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white"
                        value={includeTablet ? "yes" : "no"}
                        onChange={(e) => setIncludeTablet(e.target.value === "yes")}
                    >
                        <option value="yes">Yes</option>
                        <option value="no">No (Set Custom $/Tablet)</option>
                    </select>
                </div>

                {/* Include HSI in Box Count */}
                <div className="flex items-center gap-4 mb-2">
                    <label className="text-gray-800 dark:text-gray-200">HSI:</label>
                    <select
                        className="p-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white"
                        value={includeHSI ? "yes" : "no"}
                        onChange={(e) => setIncludeHSI(e.target.value === "yes")}
                    >
                        <option value="yes">Yes</option>
                        <option value="no">No (Set Custom $/HSI)</option>
                    </select>
                </div>

                {/* Include Watches in Box Count */}
                <div className="flex items-center gap-4">
                    <label className="text-gray-800 dark:text-gray-200">Watches:</label>
                    <select
                        className="p-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white"
                        value={includeWatch ? "yes" : "no"}
                        onChange={(e) => setIncludeWatch(e.target.value === "yes")}
                    >
                        <option value="yes">Yes</option>
                        <option value="no">No (Set Custom $/Watch)</option>
                    </select>
                </div>
            </div>

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
                                        value={threshold.itemType || "Boxes"} // Prevent undefined
                                        onChange={(e) => handleUpdate(index, "itemType", e.target.value)}
                                    >
                                        <option value="Boxes">Boxes</option>
                                        {!includeTablet && <option value="Tablets">Tablets</option>}
                                        {!includeMigrations && <option value="Migrations">Migrations</option>}
                                        {!includeHSI && <option value="HSI">HSI</option>}
                                        {!includeWatch && <option value="Watches">Watches</option>}
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
                <div className="mt-4 flex justify-end gap-4">
                    <button
                        onClick={() => handleAdd("Boxes")}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        ➕ Add Box Threshold
                    </button>
                    {!includeUpgrades && (
                        <button
                            onClick={() => handleAdd("Upgrades")}
                            className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-green-700"
                        >
                            ➕ Add Upgrade Threshold
                        </button>
                    )}
                    {!includeMigrations && (
                        <button
                            onClick={() => handleAdd("Migrations")}
                            className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-green-700"
                        >
                            ➕ Add Migrations Threshold
                        </button>
                    )}
                    {!includeTablet && (
                        <button
                            onClick={() => handleAdd("Tablets")}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                            ➕ Add Tablet Threshold
                        </button>
                    )}

                    {!includeHSI && (
                        <button
                            onClick={() => handleAdd("HSI")}
                            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                        >
                            ➕ Add HSI Threshold
                        </button>
                    )}

                    {!includeWatch && (
                        <button
                            onClick={() => handleAdd("Watches")}
                            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                        >
                            ➕ Add Watch Threshold
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
