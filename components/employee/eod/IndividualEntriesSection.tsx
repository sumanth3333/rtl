import { useState } from "react";
import InputField from "@/components/ui/InputField";

interface SplitTotals {
    boxesSold: number;
    upgrade: number;
    migrations: number;
    hsiSold: number;
    tabletsSold: number;
    watchesSold: number;
    accessoriesByEmployee: number;
    systemAccessories: number;
}

interface Props {
    employeesWorking: { employeeNtid: string; employeeName: string }[];
    individualEntries: any[];
    validationErrors: Record<string, string>;
    onChange: (index: number, field: string, value: number) => void;
    totals: SplitTotals;
    onApplySplit: (values: SplitTotals[]) => void;
}

const INT_FIELDS: (keyof SplitTotals)[] = ["boxesSold", "upgrade", "migrations", "hsiSold", "tabletsSold", "watchesSold"];
const CURRENCY_FIELDS: (keyof SplitTotals)[] = ["accessoriesByEmployee", "systemAccessories"];

// Whole-number metrics split as evenly as possible, extra units going to the first employees
function splitIntEvenly(total: number, count: number): number[] {
    if (count <= 0) { return []; }
    const base = Math.floor(total / count);
    const remainder = total - base * count;
    return Array.from({ length: count }, (_, i) => base + (i < remainder ? 1 : 0));
}

// Currency metrics split evenly to the cent, remainder cent(s) absorbed by the last employee
function splitCurrencyEvenly(total: number, count: number): number[] {
    if (count <= 0) { return []; }
    const base = Math.floor((total / count) * 100) / 100;
    const results = Array(count).fill(base);
    const allocated = parseFloat((base * count).toFixed(2));
    const remainder = parseFloat((total - allocated).toFixed(2));
    results[count - 1] = parseFloat((results[count - 1] + remainder).toFixed(2));
    return results;
}

// Whole-number metrics split by percentage, largest remainders get the leftover units so the sum matches exactly
function splitIntByPercentage(total: number, percentages: number[]): number[] {
    const raw = percentages.map((p) => (total * p) / 100);
    const floors = raw.map((v) => Math.floor(v));
    const allocated = floors.reduce((a, b) => a + b, 0);
    const remainder = total - allocated;
    const order = raw
        .map((v, i) => ({ i, frac: v - floors[i] }))
        .sort((a, b) => b.frac - a.frac);
    const result = [...floors];
    for (let k = 0; k < remainder && k < order.length; k++) {
        result[order[k].i] += 1;
    }
    return result;
}

function splitCurrencyByPercentage(total: number, percentages: number[]): number[] {
    return percentages.map((p) => parseFloat(((total * p) / 100).toFixed(2)));
}

export default function IndividualEntriesSection({
    employeesWorking,
    individualEntries,
    validationErrors,
    onChange,
    totals,
    onApplySplit,
}: Props) {
    const [showPercentageSplit, setShowPercentageSplit] = useState(false);
    const [percentages, setPercentages] = useState<number[]>(() => employeesWorking.map(() => 0));

    const count = employeesWorking.length;
    const percentageTotal = parseFloat(percentages.reduce((a, b) => a + (b || 0), 0).toFixed(2));

    const buildSplit = (getValues: (field: keyof SplitTotals) => number[]): SplitTotals[] =>
        Array.from({ length: count }, (_, i) => ({
            boxesSold: getValues("boxesSold")[i],
            upgrade: getValues("upgrade")[i],
            migrations: getValues("migrations")[i],
            hsiSold: getValues("hsiSold")[i],
            tabletsSold: getValues("tabletsSold")[i],
            watchesSold: getValues("watchesSold")[i],
            accessoriesByEmployee: getValues("accessoriesByEmployee")[i],
            systemAccessories: getValues("systemAccessories")[i],
        }));

    const handleSplitEvenly = () => {
        if (count === 0) { return; }
        const split = buildSplit((field) =>
            CURRENCY_FIELDS.includes(field)
                ? splitCurrencyEvenly(totals[field], count)
                : splitIntEvenly(totals[field], count)
        );
        onApplySplit(split);
        setShowPercentageSplit(false);
    };

    const handleApplyPercentageSplit = () => {
        if (count === 0 || percentageTotal !== 100) { return; }
        const split = buildSplit((field) =>
            CURRENCY_FIELDS.includes(field)
                ? splitCurrencyByPercentage(totals[field], percentages)
                : splitIntByPercentage(totals[field], percentages)
        );
        onApplySplit(split);
    };

    const updatePercentage = (index: number, value: string) => {
        setPercentages((prev) => {
            const next = [...prev];
            next[index] = Number(value) || 0;
            return next;
        });
    };

    return (
        <div className="mt-6 p-4 sm:p-6 bg-white dark:bg-gray-900 shadow-lg rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Individual Employee Sales</h3>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={handleSplitEvenly}
                        disabled={count === 0}
                        className="px-3 py-1.5 text-xs font-semibold rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-60"
                    >
                        Split Evenly ({count})
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowPercentageSplit((prev) => !prev)}
                        disabled={count === 0}
                        className="px-3 py-1.5 text-xs font-semibold rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-60"
                    >
                        Split by %
                    </button>
                </div>
            </div>

            {showPercentageSplit && (
                <div className="mb-6 p-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
                        Assign a percentage of the totals to each employee
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-3">
                        {employeesWorking.map((emp, index) => (
                            <InputField
                                key={emp.employeeNtid}
                                label={`${emp.employeeName} %`}
                                type="number"
                                value={percentages[index] ?? 0}
                                onChange={(e) => updatePercentage(index, e.target.value)}
                            />
                        ))}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handleApplyPercentageSplit}
                            disabled={percentageTotal !== 100}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            Apply Split
                        </button>
                        <span className={`text-xs font-semibold ${percentageTotal === 100 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                            Total: {percentageTotal}% {percentageTotal !== 100 && "(must equal 100%)"}
                        </span>
                    </div>
                </div>
            )}

            {employeesWorking.map((emp, index) => (
                <div key={emp.employeeNtid} className="mb-4 border-b pb-4">
                    <h4 className="text-md pb-3 font-semibold text-gray-700 dark:text-gray-300">{emp.employeeName} ({emp.employeeNtid})</h4>
                    <div className="grid grid-cols-3 gap-4">
                        <InputField
                            name="boxesSold"
                            label="Activations"
                            type="number"
                            value={individualEntries[index]?.boxesSold ?? 0}
                            onChange={(e) => onChange(index, "boxesSold", Number(e.target.value))}
                            error={validationErrors["boxesSold"]}
                            required
                        />
                        <InputField
                            name="upgrade"
                            label="Upgrades"
                            type="number"
                            value={individualEntries[index]?.upgrade ?? 0}
                            onChange={(e) => onChange(index, "upgrade", Number(e.target.value))}
                            error={validationErrors["upgrade"]}
                            required
                        />
                        <InputField
                            name="migrations"
                            label="Migrations"
                            type="number"
                            value={individualEntries[index]?.migrations ?? 0}
                            onChange={(e) => onChange(index, "migrations", Number(e.target.value))}
                            error={validationErrors["migrations"]}
                            required
                        />
                        <InputField
                            name="hsiSold"
                            label="HSI"
                            type="number"
                            value={individualEntries[index]?.hsiSold ?? 0}
                            onChange={(e) => onChange(index, "hsiSold", Number(e.target.value))}
                            error={validationErrors["hsiSold"]}
                            required
                        />
                        <InputField
                            name="tabletsSold"
                            label="Tablets & Watches"
                            type="number"
                            value={individualEntries[index]?.tabletsSold ?? 0}
                            onChange={(e) => onChange(index, "tabletsSold", Number(e.target.value))}
                            error={validationErrors["tabletsSold"]}
                            required
                        />
                        <InputField
                            name="watchesSold"
                            label="Free/$5 Lines(2GPROMO)"
                            type="number"
                            value={individualEntries[index]?.watchesSold ?? 0}
                            onChange={(e) => onChange(index, "watchesSold", Number(e.target.value))}
                            error={validationErrors["watchesSold"]}
                            required
                        />
                        <InputField
                            name="accessoriesByEmployee"
                            label="Total Cash/Card Diff"
                            type="number"
                            value={individualEntries[index]?.accessoriesByEmployee ?? 0}
                            onChange={(e) => onChange(index, "accessoriesByEmployee", Number(e.target.value))}
                            error={validationErrors["accessoriesByEmployee"]}
                            required
                        />
                        <InputField
                            name="systemAccessories"
                            label="System $$"
                            type="number"
                            value={individualEntries[index]?.systemAccessories ?? 0}
                            onChange={(e) => onChange(index, "systemAccessories", Number(e.target.value))}
                            error={validationErrors["systemAccessories"]}
                            required
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
