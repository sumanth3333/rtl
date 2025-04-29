import { EmployeeTarget, EmployeeTargetResponse } from "@/types/targetTypes";
import { PencilSquareIcon, PlusCircleIcon } from "@heroicons/react/24/outline";

interface EmployeeTargetTableProps {
    targets: EmployeeTargetResponse[];
    month: string;
    onEdit: (target: EmployeeTarget, employeeNtid: string) => void;
}

export default function EmployeeTargetTable({ targets, onEdit, month }: EmployeeTargetTableProps) {
    return (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Employee Targets</h2>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead className="bg-gray-700 text-white">
                        <tr>
                            <th className="p-3 text-left">Employee</th>
                            <th className="p-3 text-right">Activations</th>
                            <th className="p-3 text-right">Upgrades</th>
                            <th className="p-3 text-right">Accessories</th>
                            <th className="p-3 text-right">HSI</th>
                            <th className="p-3 text-right">Tablets</th>
                            <th className="p-3 text-right">Watches</th>
                            <th className="p-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {targets.map(({ target, employeeDTO }) => {
                            // ✅ Ensure we always pass a valid `EmployeeTarget`
                            const validTarget: EmployeeTarget = target ?? {
                                phonesTargetToEmployee: 0,
                                upgradeTargetToEmployee: 0,
                                accessoriesTargetByEmployee: 0.0,
                                hsiTarget: 0,
                                tabletsTargetByEmployee: 0,
                                smartwatchTargetByEmployee: 0,
                                targetMonth: month, // Format: YYYY-MM
                            };

                            return (
                                <tr key={employeeDTO.employeeNtid} className="border-t">
                                    <td className="p-3">{employeeDTO.employeeName}</td>
                                    {target ? (
                                        <>
                                            <td className="p-3 text-right">{target.phonesTargetToEmployee}</td>
                                            <td className="p-3 text-right">{target.upgradeTargetToEmployee}</td>
                                            <td className="p-3 text-right">${target.accessoriesTargetByEmployee.toFixed(2)}</td>
                                            <td className="p-3 text-right">{target.hsiTarget}</td>
                                            <td className="p-3 text-right">{target.tabletsTargetByEmployee}</td>
                                            <td className="p-3 text-right">{target.smartwatchTargetByEmployee}</td>
                                        </>
                                    ) : (
                                        <td colSpan={5} className="p-3 text-center text-gray-500 italic">
                                            No target set
                                        </td>
                                    )}
                                    <td className="p-3 text-center">
                                        <button
                                            onClick={() => onEdit(validTarget, employeeDTO.employeeNtid)}
                                            className="text-blue-500 hover:text-blue-700"
                                        >
                                            {target ? (
                                                <PencilSquareIcon className="w-5 h-5 inline-block" />
                                            ) : (
                                                <PlusCircleIcon className="w-5 h-5 inline-block text-green-500" />
                                            )}
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