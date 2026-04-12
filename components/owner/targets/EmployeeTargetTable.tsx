import { useEffect, useState } from "react";
import { EmployeeTarget, EmployeeTargetResponse } from "@/types/targetTypes";

interface EmployeeTargetTableProps {
    targets: EmployeeTargetResponse[];
    month: string;
    onSave: (employeeNtid: string, target: EmployeeTarget) => Promise<void>;
}

const buildDefaultTarget = (month: string): EmployeeTarget => ({
    phonesTargetToEmployee: 0,
    upgradeTargetToEmployee: 0,
    migrationTargetToEmployee: 0,
    accessoriesTargetByEmployee: 0,
    hsiTarget: 0,
    tabletsTargetByEmployee: 0,
    smartwatchTargetByEmployee: 0,
    targetMonth: month,
});

export default function EmployeeTargetTable({ targets, onSave, month }: EmployeeTargetTableProps) {
    const [drafts, setDrafts] = useState<Record<string, EmployeeTarget>>({});
    const [savingId, setSavingId] = useState<string | null>(null);

    useEffect(() => {
        const next: Record<string, EmployeeTarget> = {};
        targets.forEach(({ employeeDTO, target }) => {
            next[employeeDTO.employeeNtid] = target ?? buildDefaultTarget(month);
        });
        setDrafts(next);
    }, [targets, month]);

    const updateField = (employeeNtid: string, field: keyof EmployeeTarget, value: number) => {
        setDrafts((prev) => ({
            ...prev,
            [employeeNtid]: {
                ...(prev[employeeNtid] ?? buildDefaultTarget(month)),
                targetMonth: month,
                [field]: Number.isNaN(value) ? 0 : value,
            },
        }));
    };

    return (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Employee Targets</h2>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                    <thead className="bg-gray-700 text-white">
                        <tr>
                            <th className="p-3 text-left">Employee</th>
                            <th className="p-3 text-right">Activations</th>
                            <th className="p-3 text-right">Upgrades</th>
                            <th className="p-3 text-right">Migrations</th>
                            <th className="p-3 text-right">Accessories</th>
                            <th className="p-3 text-right">HSI</th>
                            <th className="p-3 text-right">Tablets</th>
                            <th className="p-3 text-right">Watches</th>
                            <th className="p-3 text-center">Save</th>
                        </tr>
                    </thead>
                    <tbody>
                        {targets.map(({ employeeDTO }) => {
                            const draft = drafts[employeeDTO.employeeNtid] ?? buildDefaultTarget(month);
                            return (
                                <tr key={employeeDTO.employeeNtid} className="border-t">
                                    <td className="p-3">
                                        <div className="font-semibold">{employeeDTO.employeeName}</div>
                                        <div className="text-xs text-gray-500">{employeeDTO.employeeNtid}</div>
                                    </td>
                                    <td className="p-2 text-right"><input type="number" value={draft.phonesTargetToEmployee} onChange={(e) => updateField(employeeDTO.employeeNtid, "phonesTargetToEmployee", Number(e.target.value))} className="w-24 rounded border px-2 py-1 dark:bg-gray-800" /></td>
                                    <td className="p-2 text-right"><input type="number" value={draft.upgradeTargetToEmployee} onChange={(e) => updateField(employeeDTO.employeeNtid, "upgradeTargetToEmployee", Number(e.target.value))} className="w-24 rounded border px-2 py-1 dark:bg-gray-800" /></td>
                                    <td className="p-2 text-right"><input type="number" value={draft.migrationTargetToEmployee} onChange={(e) => updateField(employeeDTO.employeeNtid, "migrationTargetToEmployee", Number(e.target.value))} className="w-24 rounded border px-2 py-1 dark:bg-gray-800" /></td>
                                    <td className="p-2 text-right"><input type="number" step="0.01" value={draft.accessoriesTargetByEmployee} onChange={(e) => updateField(employeeDTO.employeeNtid, "accessoriesTargetByEmployee", Number(e.target.value))} className="w-28 rounded border px-2 py-1 dark:bg-gray-800" /></td>
                                    <td className="p-2 text-right"><input type="number" value={draft.hsiTarget} onChange={(e) => updateField(employeeDTO.employeeNtid, "hsiTarget", Number(e.target.value))} className="w-24 rounded border px-2 py-1 dark:bg-gray-800" /></td>
                                    <td className="p-2 text-right"><input type="number" value={draft.tabletsTargetByEmployee} onChange={(e) => updateField(employeeDTO.employeeNtid, "tabletsTargetByEmployee", Number(e.target.value))} className="w-24 rounded border px-2 py-1 dark:bg-gray-800" /></td>
                                    <td className="p-2 text-right"><input type="number" value={draft.smartwatchTargetByEmployee} onChange={(e) => updateField(employeeDTO.employeeNtid, "smartwatchTargetByEmployee", Number(e.target.value))} className="w-24 rounded border px-2 py-1 dark:bg-gray-800" /></td>
                                    <td className="p-3 text-center">
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                setSavingId(employeeDTO.employeeNtid);
                                                try {
                                                    await onSave(employeeDTO.employeeNtid, { ...draft, targetMonth: month });
                                                } finally {
                                                    setSavingId(null);
                                                }
                                            }}
                                            disabled={savingId !== null}
                                            className="rounded-md bg-indigo-600 px-3 py-1 text-white hover:bg-indigo-700 disabled:opacity-60"
                                        >
                                            {savingId === employeeDTO.employeeNtid ? "Saving..." : "Save"}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
