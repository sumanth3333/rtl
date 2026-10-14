"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import {
    CommissionSpiff,
    CommissionSpiffFieldKey,
    SPIFF_FIELDS,
} from "@/types/commissionSpiffTypes";
import { fetchExistingCommissionSpiffs, saveCommissionSpiff } from "@/services/owner/commissionSpiffService";
import Button from "@/components/ui/Button";

interface CommissionSpiffsProps {
    companyName: string;
}

const currentMonth = () => new Date().toISOString().slice(0, 7);
const today = () => new Date().toISOString().slice(0, 10);
const currency = (value: number) => `$${value.toFixed(2)}`;

const setFields = (spiff: CommissionSpiff) =>
    SPIFF_FIELDS.filter((field) => Number(spiff[field.key]) > 0);

export default function CommissionSpiffs({ companyName }: CommissionSpiffsProps) {
    const [month, setMonth] = useState(currentMonth());
    const [spiffs, setSpiffs] = useState<CommissionSpiff[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    const [fromDate, setFromDate] = useState(today());
    const [toDate, setToDate] = useState(today());
    const [selectedTypes, setSelectedTypes] = useState<CommissionSpiffFieldKey[]>([]);
    const [values, setValues] = useState<Partial<Record<CommissionSpiffFieldKey, string>>>({});
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (!companyName || !month) { return; }

        const loadSpiffs = async () => {
            setLoading(true);
            setLoadError(null);
            try {
                const data = await fetchExistingCommissionSpiffs(companyName, month);
                setSpiffs(data);
            } catch (error) {
                console.error("❌ Error fetching commission spiffs:", error);
                setLoadError("Failed to load spiffs for this month.");
                setSpiffs([]);
            } finally {
                setLoading(false);
            }
        };

        loadSpiffs();
    }, [companyName, month]);

    const sortedSpiffs = useMemo(
        () => [...spiffs].sort((a, b) => b.fromDate.localeCompare(a.fromDate)),
        [spiffs],
    );

    const toggleType = (key: CommissionSpiffFieldKey) => {
        setSelectedTypes((prev) =>
            prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
        );
    };

    const removeType = (key: CommissionSpiffFieldKey) => {
        setSelectedTypes((prev) => prev.filter((k) => k !== key));
        setValues((prev) => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
    };

    const handleValueChange = (key: CommissionSpiffFieldKey, value: string) => {
        setValues((prev) => ({ ...prev, [key]: value }));
    };

    const canSave =
        !!companyName &&
        !!fromDate &&
        !!toDate &&
        fromDate <= toDate &&
        selectedTypes.length > 0 &&
        selectedTypes.every((key) => Number(values[key]) > 0);

    const handleSave = async () => {
        if (!canSave) { return; }

        setSaving(true);
        setSaveMessage(null);
        try {
            const payload = {
                companyName,
                fromDate,
                toDate,
                ...Object.fromEntries(
                    SPIFF_FIELDS.map((field) => [
                        field.key,
                        selectedTypes.includes(field.key) ? Number(values[field.key]) : 0,
                    ])
                ),
            };

            const saved = await saveCommissionSpiff(payload);
            setSpiffs((prev) => [saved, ...prev]);
            setSaveMessage({ text: "✅ Spiff saved successfully!", type: "success" });

            setSelectedTypes([]);
            setValues({});
            setFromDate(today());
            setToDate(today());
        } catch (error) {
            console.error("❌ Error saving commission spiff:", error);
            setSaveMessage({ text: "❌ Failed to save spiff. Please try again.", type: "error" });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">⚡ Limited-Time Spiffs</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Boost specific commissions for a date range. Only the types you select are shown.
                    </p>
                </div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Month
                    <input
                        type="month"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="ml-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-sm text-gray-900 dark:text-gray-100"
                    />
                </label>
            </div>

            {/* Existing spiffs for the selected month */}
            <div className="space-y-3 mb-6">
                {loading ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading spiffs...</p>
                ) : loadError ? (
                    <p className="text-sm text-red-500">{loadError}</p>
                ) : sortedSpiffs.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No spiffs set for this month.</p>
                ) : (
                    sortedSpiffs.map((spiff) => (
                        <div
                            key={spiff.id}
                            className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/20 p-3"
                        >
                            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                                {spiff.fromDate} → {spiff.toDate}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {setFields(spiff).map((field) => (
                                    <span
                                        key={field.key}
                                        className="inline-flex items-center gap-1 rounded-full border border-amber-300 dark:border-amber-700 bg-white dark:bg-gray-900 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300"
                                    >
                                        {field.label}: {currency(Number(spiff[field.key]))}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add new spiff */}
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 p-4 space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-200">Add New Spiff</h4>

                <div className="flex flex-wrap gap-4">
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                        From
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="mt-1 block rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100"
                        />
                    </label>
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                        To
                        <input
                            type="date"
                            value={toDate}
                            min={fromDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="mt-1 block rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100"
                        />
                    </label>
                </div>

                {/* Multi-select dropdown of spiff types */}
                <div className="relative" ref={dropdownRef}>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                        Spiff Types
                    </label>
                    <button
                        type="button"
                        onClick={() => setDropdownOpen((prev) => !prev)}
                        className="w-full sm:w-72 flex items-center justify-between rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                    >
                        {selectedTypes.length === 0 ? "Select one or more types" : `${selectedTypes.length} type${selectedTypes.length === 1 ? "" : "s"} selected`}
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                    </button>

                    {dropdownOpen && (
                        <div className="absolute z-10 mt-1 w-full sm:w-72 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg max-h-64 overflow-y-auto">
                            {SPIFF_FIELDS.map((field) => (
                                <label
                                    key={field.key}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedTypes.includes(field.key)}
                                        onChange={() => toggleType(field.key)}
                                        className="rounded border-gray-300"
                                    />
                                    {field.label}
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Value inputs — only for selected types */}
                {selectedTypes.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {selectedTypes.map((key) => {
                            const field = SPIFF_FIELDS.find((f) => f.key === key)!;
                            return (
                                <div
                                    key={key}
                                    className="flex items-center gap-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1.5"
                                >
                                    <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{field.label}</span>
                                    <span className="text-sm text-gray-500">$</span>
                                    <input
                                        type="number"
                                        min={0}
                                        step="0.01"
                                        value={values[key] ?? ""}
                                        onChange={(e) => handleValueChange(key, e.target.value)}
                                        placeholder="0.00"
                                        className="w-20 text-sm text-right bg-transparent focus:outline-none text-gray-900 dark:text-gray-100"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeType(key)}
                                        className="text-gray-400 hover:text-red-500"
                                        aria-label={`Remove ${field.label}`}
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="flex flex-col items-end gap-2">
                    <Button onClick={handleSave} isLoading={saving} disabled={!canSave} variant="warning">
                        Save Spiff
                    </Button>
                    {saveMessage && (
                        <div
                            className={`px-3 py-1.5 rounded-md text-xs font-medium ${saveMessage.type === "success"
                                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                                }`}
                        >
                            {saveMessage.text}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
