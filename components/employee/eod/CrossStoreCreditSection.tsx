"use client";

import { useMemo, useState } from "react";
import InputField from "@/components/ui/InputField";
import { EmployeeSaleEntry } from "@/types/employeeSchema";

interface CompanyEmployee {
    employeeNtid: string;
    employeeName: string;
}

interface Props {
    companyEmployees: CompanyEmployee[];
    excludeNtids: string[];
    entries: EmployeeSaleEntry[];
    onAdd: (entry: EmployeeSaleEntry) => void;
    onUpdate: (index: number, entry: EmployeeSaleEntry) => void;
    onRemove: (index: number) => void;
    loading?: boolean;
}

const emptyDraft = {
    employeeNtid: "",
    boxesSold: 0,
    upgrade: 0,
    migrations: 0,
    hsiSold: 0,
    tabletsSold: 0,
    watchesSold: 0,
    accessoriesByEmployee: 0,
    systemAccessories: 0,
};

export default function CrossStoreCreditSection({
    companyEmployees,
    excludeNtids,
    entries,
    onAdd,
    onUpdate,
    onRemove,
    loading = false,
}: Props) {
    const [draft, setDraft] = useState(emptyDraft);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const alreadyAdded = useMemo(() => new Set(entries.map((e) => e.employeeNtid)), [entries]);
    const excluded = useMemo(() => new Set(excludeNtids), [excludeNtids]);

    const availableEmployees = useMemo(
        () => companyEmployees.filter((emp) => !excluded.has(emp.employeeNtid) && !alreadyAdded.has(emp.employeeNtid)),
        [companyEmployees, excluded, alreadyAdded]
    );

    const nameFor = (ntid: string) => companyEmployees.find((emp) => emp.employeeNtid === ntid)?.employeeName ?? ntid;

    const updateDraft = (field: keyof typeof emptyDraft, value: string) => {
        setDraft((prev) => ({
            ...prev,
            [field]: field === "employeeNtid" ? value : Number(value) || 0,
        }));
    };

    const handleAdd = () => {
        if (!draft.employeeNtid) { return; }
        onAdd({ ...draft, salesCreditOnly: true });
        setDraft(emptyDraft);
    };

    const handleEdit = (index: number) => {
        const entry = entries[index];
        if (!entry) { return; }
        setEditingIndex(index);
        setDraft({
            employeeNtid: entry.employeeNtid,
            boxesSold: entry.boxesSold,
            upgrade: entry.upgrade,
            migrations: entry.migrations,
            hsiSold: entry.hsiSold,
            tabletsSold: entry.tabletsSold,
            watchesSold: entry.watchesSold,
            accessoriesByEmployee: entry.accessoriesByEmployee,
            systemAccessories: entry.systemAccessories,
        });
    };

    const handleSaveEdit = () => {
        if (editingIndex === null) { return; }
        onUpdate(editingIndex, { ...draft, salesCreditOnly: true });
        setEditingIndex(null);
        setDraft(emptyDraft);
    };

    const handleCancelEdit = () => {
        setEditingIndex(null);
        setDraft(emptyDraft);
    };

    const isEditing = editingIndex !== null;

    return (
        <div className="mt-6 p-4 sm:p-6 bg-white dark:bg-gray-900 shadow-lg rounded-lg">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">Sales Credit From Other Stores</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Add an employee who didn&apos;t work here today but should be credited for a sale.
            </p>

            {entries.length > 0 && (
                <div className="mb-6 overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="py-2 pr-4">Employee</th>
                                <th className="py-2 pr-4">Activations</th>
                                <th className="py-2 pr-4">Upgrades</th>
                                <th className="py-2 pr-4">Migrations</th>
                                <th className="py-2 pr-4">HSI</th>
                                <th className="py-2 pr-4">Tablets</th>
                                <th className="py-2 pr-4">2GPROMO</th>
                                <th className="py-2 pr-4">Cash/Card Diff</th>
                                <th className="py-2 pr-4">System $$</th>
                                <th className="py-2 pr-4"></th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-800 dark:text-gray-200">
                            {entries.map((entry, index) => (
                                <tr
                                    key={`${entry.employeeNtid}-${index}`}
                                    className={`border-b border-gray-100 dark:border-gray-700 ${editingIndex === index ? "bg-blue-50 dark:bg-blue-950/30" : ""}`}
                                >
                                    <td className="py-2 pr-4 font-medium">
                                        {nameFor(entry.employeeNtid)} ({entry.employeeNtid})
                                    </td>
                                    <td className="py-2 pr-4">{entry.boxesSold}</td>
                                    <td className="py-2 pr-4">{entry.upgrade}</td>
                                    <td className="py-2 pr-4">{entry.migrations}</td>
                                    <td className="py-2 pr-4">{entry.hsiSold}</td>
                                    <td className="py-2 pr-4">{entry.tabletsSold}</td>
                                    <td className="py-2 pr-4">{entry.watchesSold}</td>
                                    <td className="py-2 pr-4">{entry.accessoriesByEmployee}</td>
                                    <td className="py-2 pr-4">{entry.systemAccessories}</td>
                                    <td className="py-2 pr-4 text-right whitespace-nowrap">
                                        <button
                                            type="button"
                                            onClick={() => handleEdit(index)}
                                            className="text-blue-600 text-xs font-medium hover:underline mr-3"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (editingIndex === index) { handleCancelEdit(); }
                                                onRemove(index);
                                            }}
                                            className="text-red-600 text-xs font-medium hover:underline"
                                        >
                                            ✕ Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                {isEditing && (
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                        Editing {nameFor(draft.employeeNtid)} ({draft.employeeNtid})
                    </p>
                )}
                <div className="flex flex-col mb-4">
                    <label className="text-gray-800 dark:text-gray-200 text-xs sm:text-sm font-semibold mb-1">Employee</label>
                    <select
                        value={draft.employeeNtid}
                        onChange={(e) => updateDraft("employeeNtid", e.target.value)}
                        disabled={loading || isEditing}
                        className="w-full max-w-full sm:max-w-[28rem] rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2.5 py-2 sm:px-3 sm:py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                    >
                        <option value="">{loading ? "Loading employees..." : "Select employee"}</option>
                        {isEditing && (
                            <option value={draft.employeeNtid}>
                                {nameFor(draft.employeeNtid)} ({draft.employeeNtid})
                            </option>
                        )}
                        {availableEmployees.map((emp) => (
                            <option key={emp.employeeNtid} value={emp.employeeNtid}>
                                {emp.employeeName} ({emp.employeeNtid})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <InputField
                        label="Activations"
                        type="number"
                        value={draft.boxesSold}
                        onChange={(e) => updateDraft("boxesSold", e.target.value)}
                    />
                    <InputField
                        label="Upgrades"
                        type="number"
                        value={draft.upgrade}
                        onChange={(e) => updateDraft("upgrade", e.target.value)}
                    />
                    <InputField
                        label="Migrations"
                        type="number"
                        value={draft.migrations}
                        onChange={(e) => updateDraft("migrations", e.target.value)}
                    />
                    <InputField
                        label="HSI"
                        type="number"
                        value={draft.hsiSold}
                        onChange={(e) => updateDraft("hsiSold", e.target.value)}
                    />
                    <InputField
                        label="Tablets & Watches"
                        type="number"
                        value={draft.tabletsSold}
                        onChange={(e) => updateDraft("tabletsSold", e.target.value)}
                    />
                    <InputField
                        label="Free/$5 Lines(2GPROMO)"
                        type="number"
                        value={draft.watchesSold}
                        onChange={(e) => updateDraft("watchesSold", e.target.value)}
                    />
                    <InputField
                        label="Total Cash/Card Diff"
                        type="number"
                        value={draft.accessoriesByEmployee}
                        onChange={(e) => updateDraft("accessoriesByEmployee", e.target.value)}
                    />
                    <InputField
                        label="System $$"
                        type="number"
                        value={draft.systemAccessories}
                        onChange={(e) => updateDraft("systemAccessories", e.target.value)}
                    />
                </div>

                <div className="mt-4 flex gap-3">
                    {isEditing ? (
                        <>
                            <button
                                type="button"
                                onClick={handleSaveEdit}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
                            >
                                Save Changes
                            </button>
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={handleAdd}
                            disabled={!draft.employeeNtid}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            + Add Entry
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
