"use client";

import { useState } from "react";
import PaycheckLayout from "../layout";

export default function CompanyCommissionPage() {
    const [paymentFrequency, setPaymentFrequency] = useState<string>("weekly");
    const [commissionType, setCommissionType] = useState<string>("fixed");
    const [fixedCommission, setFixedCommission] = useState<number>(3);
    const [tiers, setTiers] = useState<{ min: number; max?: number; rate: number }[]>([
        { min: 1, max: 29, rate: 3 },
        { min: 30, max: 69, rate: 4 },
        { min: 70, max: undefined, rate: 5 },
    ]);
    const [includeTablet, setIncludeTablet] = useState<boolean>(true);
    const [tabletCommission, setTabletCommission] = useState<number>(0);
    const [includeHSI, setIncludeHSI] = useState<boolean>(true);
    const [hsiCommission, setHsiCommission] = useState<number>(0);
    const [includeWatch, setIncludeWatch] = useState<boolean>(true);
    const [watchCommission, setWatchCommission] = useState<number>(0);

    const handleAddTier = () => {
        setTiers([...tiers, { min: tiers[tiers.length - 1].max! + 1, max: undefined, rate: 0 }]);
    };

    return (
        <>
            <h1 className="text-2xl sm:text-3xl font-bold mb-4">Company Commission Settings</h1>
            <p className="text-gray-700 dark:text-gray-300">
                Configure **commission structure, payment frequency, tier limits, and incentives per box**.
            </p>

            {/* ✅ Payment Frequency */}
            <div className="mt-6">
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Select Payment Frequency</label>
                <select
                    value={paymentFrequency}
                    onChange={(e) => setPaymentFrequency(e.target.value)}
                    className="p-3 border rounded-lg w-full max-w-md bg-white dark:bg-gray-800 dark:text-gray-200"
                >
                    <option value="weekly">Weekly (Hourly Pay Weekly, Commission Last Week)</option>
                    <option value="biweekly">Twice a Month (Hourly Pay First, Commission Second Paycheck)</option>
                    <option value="monthly">Monthly (Hourly Pay & Commission Together)</option>
                </select>
            </div>

            {/* ✅ Box Commission Structure */}
            <div className="mt-6">
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Box Commission Structure</label>
                <select
                    value={commissionType}
                    onChange={(e) => setCommissionType(e.target.value)}
                    className="p-3 border rounded-lg w-full max-w-md bg-white dark:bg-gray-800 dark:text-gray-200"
                >
                    <option value="fixed">Fixed Commission</option>
                    <option value="tier">Tier-Based Commission</option>
                </select>
            </div>

            {/* ✅ Fixed Commission Input */}
            {commissionType === "fixed" && (
                <div className="mt-4">
                    <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Fixed Commission ($/per box)</label>
                    <input
                        type="number"
                        value={fixedCommission}
                        onChange={(e) => setFixedCommission(Number(e.target.value))}
                        className="p-3 border rounded-lg w-full max-w-md bg-white dark:bg-gray-800 dark:text-gray-200"
                    />
                </div>
            )}

            {/* ✅ Tier-Based Commission Input */}
            {commissionType === "tier" && (
                <div className="mt-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-3">Tier-Based Commission</h3>
                    {tiers.map((tier, index) => (
                        <div key={index} className="flex items-center gap-4 mb-3">
                            <input
                                type="number"
                                value={tier.min}
                                readOnly
                                className="p-3 border rounded-lg w-24 bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
                            />
                            <span className="text-gray-700 dark:text-gray-300">to</span>
                            <input
                                type="number"
                                value={tier.max ?? ""}
                                onChange={(e) =>
                                    setTiers(
                                        tiers.map((t, i) =>
                                            i === index ? { ...t, max: e.target.value ? Number(e.target.value) : undefined } : t
                                        )
                                    )
                                }
                                className="p-3 border rounded-lg w-24 bg-white dark:bg-gray-800 dark:text-gray-200"
                            />
                            <span className="text-gray-700 dark:text-gray-300">$/box</span>
                            <input
                                type="number"
                                value={tier.rate}
                                onChange={(e) =>
                                    setTiers(tiers.map((t, i) => (i === index ? { ...t, rate: Number(e.target.value) } : t)))
                                }
                                className="p-3 border rounded-lg w-24 bg-white dark:bg-gray-800 dark:text-gray-200"
                            />
                        </div>
                    ))}
                    <button
                        onClick={handleAddTier}
                        className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all"
                    >
                        ➕ Add Tier
                    </button>
                </div>
            )}

            {/* ✅ Include Tablets */}
            <div className="mt-6">
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Include Tablets in Box Count?</label>
                <select
                    value={includeTablet ? "yes" : "no"}
                    onChange={(e) => setIncludeTablet(e.target.value === "yes")}
                    className="p-3 border rounded-lg w-full max-w-md bg-white dark:bg-gray-800 dark:text-gray-200"
                >
                    <option value="yes">Yes</option>
                    <option value="no">No (Set $/Tablet)</option>
                </select>
                {!includeTablet && (
                    <input
                        type="number"
                        value={tabletCommission}
                        onChange={(e) => setTabletCommission(Number(e.target.value))}
                        className="mt-2 p-3 border rounded-lg w-full max-w-md bg-white dark:bg-gray-800 dark:text-gray-200"
                        placeholder="Enter $ per Tablet"
                    />
                )}
            </div>

            {/* ✅ Include HSI */}
            <div className="mt-6">
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Include HSI in Box Count?</label>
                <select
                    value={includeHSI ? "yes" : "no"}
                    onChange={(e) => setIncludeHSI(e.target.value === "yes")}
                    className="p-3 border rounded-lg w-full max-w-md bg-white dark:bg-gray-800 dark:text-gray-200"
                >
                    <option value="yes">Yes</option>
                    <option value="no">No (Set $/HSI)</option>
                </select>
                {!includeHSI && (
                    <input
                        type="number"
                        value={hsiCommission}
                        onChange={(e) => setHsiCommission(Number(e.target.value))}
                        className="mt-2 p-3 border rounded-lg w-full max-w-md bg-white dark:bg-gray-800 dark:text-gray-200"
                        placeholder="Enter $ per HSI"
                    />
                )}
            </div>

            {/* ✅ Include Watches */}
            <div className="mt-6">
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Include Watches in Box Count?</label>
                <select
                    value={includeWatch ? "yes" : "no"}
                    onChange={(e) => setIncludeWatch(e.target.value === "yes")}
                    className="p-3 border rounded-lg w-full max-w-md bg-white dark:bg-gray-800 dark:text-gray-200"
                >
                    <option value="yes">Yes</option>
                    <option value="no">No (Set $/Watch)</option>
                </select>
            </div>

            <p className="mt-6 text-gray-700 dark:text-gray-300 font-semibold">Accessories Commission: **7%**</p>
        </>
    );
}
