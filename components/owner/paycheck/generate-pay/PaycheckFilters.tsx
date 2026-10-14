"use client";

import { useEffect, useState } from "react";
import {
    CalendarDaysIcon,
    ArchiveBoxIcon,
    ShoppingBagIcon,
    ReceiptPercentIcon,
    TagIcon,
    CurrencyDollarIcon,
    ExclamationCircleIcon,
    ArrowPathIcon,
    SparklesIcon,
} from "@heroicons/react/24/outline";

interface PaycheckFiltersProps {
    startDate: string;
    endDate: string;
    includeBoxes: string;
    includeAccessories: string;
    includeTaxes: string;
    commissionPerCompletedAccount: string;
    setStartDate: (date: string) => void;
    setEndDate: (date: string) => void;
    setIncludeTaxes: (value: string) => void;
    setIncludeBoxes: (value: string) => void;
    setIncludeAccessories: (value: string) => void;
    setCommissionPerCompletedAccount: (value: string) => void;
    fetchPaychecks: () => void;
    isLoading?: boolean;
}

type DatePreset = "thisMonth" | "lastMonth" | "custom";

const toISODate = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().split("T")[0];

const getThisMonthRange = () => {
    const now = new Date();
    return {
        start: toISODate(new Date(now.getFullYear(), now.getMonth(), 1)),
        end: toISODate(now),
    };
};

const getLastMonthRange = () => {
    const now = new Date();
    return {
        start: toISODate(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
        end: toISODate(new Date(now.getFullYear(), now.getMonth(), 0)), // day 0 = last day of previous month
    };
};

const formatDisplayDate = (value: string) => {
    if (!value) {
        return "—";
    }
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

function ToggleField({
    label,
    icon: Icon,
    value,
    onChange,
}: {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="flex flex-col">
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <Icon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                {label}
            </label>
            <div className="inline-flex rounded-md border border-gray-300 dark:border-gray-600 overflow-hidden">
                {(["YES", "NO"] as const).map((option) => (
                    <button
                        key={option}
                        type="button"
                        onClick={() => onChange(option)}
                        className={`flex-1 px-3 py-2.5 text-sm font-semibold transition-colors ${value === option
                            ? option === "YES"
                                ? "bg-emerald-600 text-white"
                                : "bg-gray-500 text-white"
                            : "bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                            }`}
                    >
                        {option === "YES" ? "Yes" : "No"}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default function PaycheckFilters({
    startDate,
    endDate,
    includeBoxes,
    includeAccessories,
    includeTaxes,
    commissionPerCompletedAccount,
    setStartDate,
    setEndDate,
    setIncludeBoxes,
    setIncludeTaxes,
    setIncludeAccessories,
    setCommissionPerCompletedAccount,
    fetchPaychecks,
    isLoading = false,
}: PaycheckFiltersProps) {
    const [error, setError] = useState<string | null>(null);
    const [datePreset, setDatePreset] = useState<DatePreset>("thisMonth");
    const [includeCommission, setIncludeCommission] = useState<string>("NO");

    const currenDate = new Date();
    const today = new Date(currenDate.getFullYear(), currenDate.getMonth(), currenDate.getDate())
        .toISOString()
        .split("T")[0];

    // ✅ Default to "This Month" on first load so the form is ready to go without manual date entry
    useEffect(() => {
        const { start, end } = getThisMonthRange();
        setStartDate(start);
        setEndDate(end);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const applyPreset = (preset: DatePreset) => {
        setDatePreset(preset);
        setError(null);
        if (preset === "thisMonth") {
            const { start, end } = getThisMonthRange();
            setStartDate(start);
            setEndDate(end);
        } else if (preset === "lastMonth") {
            const { start, end } = getLastMonthRange();
            setStartDate(start);
            setEndDate(end);
        }
    };

    // ✅ Boxes/Accessories/MiM only matter when commission is being included at all
    const handleIncludeCommissionChange = (value: string) => {
        setIncludeCommission(value);
        if (value === "NO") {
            setIncludeBoxes("NO");
            setIncludeAccessories("NO");
            setCommissionPerCompletedAccount("NO");
        } else {
            setIncludeBoxes("YES");
            setIncludeAccessories("YES");
            setCommissionPerCompletedAccount("YES");
        }
    };

    // ✅ Handle Generate Pay Click
    const handleGeneratePay = () => {
        if (!startDate || !endDate) {
            setError("Please select both a start date and an end date.");
            return;
        }
        setError(null); // Clear error if valid
        fetchPaychecks(); // Call fetch API
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 mb-6 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                    <SparklesIcon className="h-5 w-5 text-blue-500" />
                    Filter Paychecks
                </h3>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                    {/* ✅ Date Range */}
                    <div className="flex flex-col sm:col-span-2 lg:col-span-2">
                        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            <CalendarDaysIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            Date Range
                        </label>

                        <div className="inline-flex rounded-md border border-gray-300 dark:border-gray-600 overflow-hidden mb-2">
                            {([
                                ["thisMonth", "This Month"],
                                ["lastMonth", "Last Month"],
                                ["custom", "Custom"],
                            ] as [DatePreset, string][]).map(([value, label]) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => applyPreset(value)}
                                    className={`flex-1 px-2.5 py-2 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${datePreset === value
                                        ? "bg-blue-600 text-white"
                                        : "bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {datePreset === "custom" ? (
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    max={today}
                                    className={`p-2.5 border rounded-md bg-white dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 ${error && !startDate ? "border-red-400 focus:ring-red-400" : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                                        }`}
                                />
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    min={startDate}
                                    max={today}
                                    className={`p-2.5 border rounded-md bg-white dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 ${error && !endDate ? "border-red-400 focus:ring-red-400" : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                                        }`}
                                />
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 px-3 py-2.5 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-sm text-gray-700 dark:text-gray-300">
                                {formatDisplayDate(startDate)} <span className="text-gray-400">→</span> {formatDisplayDate(endDate)}
                            </div>
                        )}
                    </div>

                    <ToggleField label="Deduct Taxes?" icon={ReceiptPercentIcon} value={includeTaxes} onChange={setIncludeTaxes} />

                    {/* ✅ Commission master toggle — expands to host its sub-toggles once enabled */}
                    <div className={`flex flex-col ${includeCommission === "YES" ? "sm:col-span-2 lg:col-span-3" : ""}`}>
                        <ToggleField
                            label="Include Commission?"
                            icon={CurrencyDollarIcon}
                            value={includeCommission}
                            onChange={handleIncludeCommissionChange}
                        />

                        {includeCommission === "YES" && (
                            <div className="relative mt-3 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/20 pl-4 pr-3 py-3">
                                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg bg-blue-400 dark:bg-blue-700" />
                                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-2">
                                    Commission Includes
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <ToggleField label="Boxes" icon={ArchiveBoxIcon} value={includeBoxes} onChange={setIncludeBoxes} />
                                    <ToggleField label="Accessories" icon={ShoppingBagIcon} value={includeAccessories} onChange={setIncludeAccessories} />
                                    <ToggleField
                                        label="Fulfilled MiM Order"
                                        icon={TagIcon}
                                        value={commissionPerCompletedAccount}
                                        onChange={setCommissionPerCompletedAccount}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ✅ Show error message if validation fails */}
                {error && (
                    <div className="mt-4 flex items-center gap-2 rounded-md border border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/40 px-3 py-2">
                        <ExclamationCircleIcon className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
                        <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
                    </div>
                )}

                {/* ✅ Generate Pay Button */}
                <div className="mt-6 flex justify-center">
                    <button
                        onClick={handleGeneratePay}
                        disabled={isLoading}
                        className={`inline-flex items-center gap-2 px-6 py-3 text-base font-semibold rounded-md shadow-sm transition-all ${isLoading
                            ? "bg-gray-400 text-white cursor-not-allowed"
                            : "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600"
                            }`}
                    >
                        <ArrowPathIcon className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
                        {isLoading ? "Generating..." : "Generate Pay"}
                    </button>
                </div>
            </div>
        </div>
    );
}
