import { Threshold } from "@/types/companyTypes";
import { useEffect, useRef, useState } from "react";

interface PreactivationDeductionTableProps {
    thresholds: Threshold[];
    setThresholds: (updated: Threshold[]) => void;
}

const preactOptions = ["PERCENTAGE", "INVOICE", "PERBOX"] as const;

export default function PreactivationDeductionTable({
    thresholds,
    setThresholds,
}: PreactivationDeductionTableProps) {
    const [localPreact, setLocalPreact] = useState<Threshold | null>(null);
    const [percentageInput, setPercentageInput] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);
    const initializedRef = useRef(false);

    const isPreactType = (type: string): type is typeof preactOptions[number] =>
        preactOptions.includes(type as typeof preactOptions[number]);

    useEffect(() => {
        const preactThresholds = thresholds.filter((t) => isPreactType(t.itemType));

        if (preactThresholds.length === 1) {
            const existing = preactThresholds[0];
            setLocalPreact(existing);
            if (existing.itemType === "PERCENTAGE") {
                setPercentageInput(existing.payAmount);
            }
        } else if (preactThresholds.length === 0) {
            const defaultRule: Threshold = {
                itemType: "INVOICE",
                minimumThreshold: 0,
                threshold: 0,
                payAmount: 0,
            };
            setThresholds([...thresholds, defaultRule]);
            setLocalPreact(defaultRule);
        } else {
            console.warn("⚠️ Multiple preact rules found. Keeping the first.");
            setThresholds([
                ...thresholds.filter((t) => !isPreactType(t.itemType)),
                preactThresholds[0],
            ]);
            setLocalPreact(preactThresholds[0]);
            if (preactThresholds[0].itemType === "PERCENTAGE") {
                setPercentageInput(preactThresholds[0].payAmount);
            }
        }
    }, [thresholds, setThresholds]);


    if (!localPreact) return (
        <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
            Loading preactivation deduction settings...
        </div>
    );

    const updateThreshold = (updatedRule: Threshold) => {
        const updatedThresholds = thresholds
            .filter((t) => !isPreactType(t.itemType))
            .concat(updatedRule);
        setThresholds(updatedThresholds);
        setLocalPreact(updatedRule);
    };

    const handleTypeChange = (type: Threshold["itemType"]) => {
        const updatedRule: Threshold = {
            ...localPreact!,
            itemType: type,
            payAmount:
                type === "PERCENTAGE"
                    ? percentageInput
                    : type === "INVOICE"
                        ? 0
                        : localPreact!.payAmount,
            minimumThreshold: 0,
            threshold: 0,
        };

        updateThreshold(updatedRule);
        setError(null);
    };

    const handleAmountChange = (value: number) => {
        if (localPreact!.itemType === "PERCENTAGE") {
            if (value < 0 || value > 100) {
                setError("❌ Enter a value between 0 and 100%");
                return;
            }

            const updatedRule: Threshold = {
                ...localPreact!,
                payAmount: value,
            };

            updateThreshold(updatedRule);
            setPercentageInput(value);
        } else {
            const updatedRule: Threshold = {
                ...localPreact!,
                payAmount: value,
            };

            updateThreshold(updatedRule);
        }

        setError(null);
    };

    const sampleAccessories = 300;
    const estimatedDeduction =
        localPreact!.itemType === "PERCENTAGE"
            ? (localPreact!.payAmount / 100) * sampleAccessories
            : localPreact!.itemType === "PERBOX"
                ? localPreact!.payAmount
                : 0;

    return (
        <div className="mt-8">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                📦 Preactivation Deduction Structure
            </h3>

            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                        Deduction Type
                    </label>
                    <select
                        value={localPreact!.itemType}
                        onChange={(e) =>
                            handleTypeChange(e.target.value as Threshold["itemType"])
                        }
                        className="w-full p-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white"
                    >
                        {preactOptions.map((type) => (
                            <option key={type} value={type}>
                                {type === "PERCENTAGE"
                                    ? "Percentage of Accessories"
                                    : type === "INVOICE"
                                        ? "Invoice Activation Cost (Default)"
                                        : "Flat Deduction per Box"}
                            </option>
                        ))}
                    </select>
                </div>

                {(localPreact!.itemType === "PERCENTAGE" ||
                    localPreact!.itemType === "PERBOX") && (
                        <div>
                            <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                                {localPreact!.itemType === "PERCENTAGE"
                                    ? "Deduction Percentage (1 to 100%)"
                                    : "Flat Deduction per Box ($)"}
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                min={0}
                                max={localPreact!.itemType === "PERCENTAGE" ? 100 : undefined}
                                value={
                                    localPreact!.itemType === "PERCENTAGE"
                                        ? percentageInput
                                        : localPreact!.payAmount
                                }
                                onChange={(e) =>
                                    handleAmountChange(parseFloat(e.target.value) || 0)
                                }
                                className="w-full p-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white"
                            />
                            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
                        </div>
                    )}

                {(localPreact!.itemType === "PERCENTAGE" ||
                    localPreact!.itemType === "PERBOX") && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                            🧮 Estimated Deduction:{" "}
                            <strong>${estimatedDeduction.toFixed(2)}</strong>{" "}
                            {localPreact!.itemType === "PERCENTAGE"
                                ? `(on $${sampleAccessories} accessories)`
                                : ""}
                        </p>
                    )}
            </div>
        </div>
    );
}
