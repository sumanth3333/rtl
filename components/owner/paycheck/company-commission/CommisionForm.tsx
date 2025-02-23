"use client";

import { useState } from "react";

interface CommissionFormProps {
    initialData: any;
    onSave: (data: any) => void;
}

export default function CommissionForm({ initialData, onSave }: CommissionFormProps) {
    const [settings, setSettings] = useState(initialData);

    const updateField = (field: string, value: any) => {
        setSettings((prev: any) => ({ ...prev, [field]: value }));
    };

    return (
        <div className="w-full max-w-3xl mx-auto mt-8 bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg border border-gray-300 dark:border-gray-700">
            {/* ✅ Payment Frequency */}
            <div className="mb-6">
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Select Payment Frequency</label>
                <select
                    value={settings.paymentFrequency}
                    onChange={(e) => updateField("paymentFrequency", e.target.value)}
                    className="p-3 border rounded-lg w-full bg-white dark:bg-gray-800 dark:text-gray-200"
                >
                    <option value="weekly">Weekly (Hourly Pay Weekly, Commission Last Week)</option>
                    <option value="biweekly">Twice a Month (Hourly Pay First, Commission Second Paycheck)</option>
                    <option value="monthly">Monthly (Hourly Pay & Commission Together)</option>
                </select>
            </div>

            {/* ✅ Box Commission Structure */}
            <div className="mb-6">
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Box Commission Structure</label>
                <select
                    value={settings.commissionType}
                    onChange={(e) => updateField("commissionType", e.target.value)}
                    className="p-3 border rounded-lg w-full bg-white dark:bg-gray-800 dark:text-gray-200"
                >
                    <option value="fixed">Fixed Commission</option>
                    <option value="tier">Tier-Based Commission</option>
                </select>
            </div>

            {/* ✅ Fixed Commission Input */}
            {settings.commissionType === "fixed" && (
                <div className="mb-6">
                    <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Fixed Commission ($/per box)</label>
                    <input
                        type="number"
                        value={settings.fixedCommission}
                        onChange={(e) => updateField("fixedCommission", Number(e.target.value))}
                        className="p-3 border rounded-lg w-full bg-white dark:bg-gray-800 dark:text-gray-200"
                    />
                </div>
            )}

            {/* ✅ Tier-Based Commission */}
            {settings.commissionType === "tier" && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Tier-Based Commission</h3>
                    {settings.tiers.map((tier: any, index: number) => (
                        <div key={index} className="flex gap-4 mb-3">
                            <input
                                type="number"
                                value={tier.min}
                                readOnly
                                className="p-3 border rounded-lg w-24 bg-gray-100 dark:bg-gray-800"
                            />
                            <span className="text-gray-700 dark:text-gray-300">to</span>
                            <input
                                type="number"
                                value={tier.max ?? ""}
                                onChange={(e) =>
                                    updateField("tiers", settings.tiers.map((t: any, i: number) =>
                                        i === index ? { ...t, max: Number(e.target.value) || undefined } : t
                                    ))
                                }
                                className="p-3 border rounded-lg w-24 bg-white dark:bg-gray-800 dark:text-gray-200"
                            />
                            <span className="text-gray-700 dark:text-gray-300">$/box</span>
                            <input
                                type="number"
                                value={tier.rate}
                                onChange={(e) =>
                                    updateField("tiers", settings.tiers.map((t: any, i: number) =>
                                        i === index ? { ...t, rate: Number(e.target.value) } : t
                                    ))
                                }
                                className="p-3 border rounded-lg w-24 bg-white dark:bg-gray-800 dark:text-gray-200"
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* ✅ Accessories Commission */}
            <div className="mb-6">
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Accessories Commission (%)</label>
                <input
                    type="number"
                    value={settings.accessoriesCommission}
                    onChange={(e) => updateField("accessoriesCommission", Number(e.target.value))}
                    className="p-3 border rounded-lg w-full bg-white dark:bg-gray-800 dark:text-gray-200"
                />
            </div>

            {/* ✅ Save Button */}
            <button
                onClick={() => onSave(settings)}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all"
            >
                Save Settings
            </button>
        </div>
    );
}
