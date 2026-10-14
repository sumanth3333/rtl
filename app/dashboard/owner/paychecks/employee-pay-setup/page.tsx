"use client";

import { useEffect, useState } from "react";
import { getEmployees } from "@/services/owner/ownerService";
import { Employee } from "@/types/employeeSchema";
import { useOwner } from "@/hooks/useOwner";
import { toast } from "react-toastify";
import apiClient from "@/services/api/apiClient";

export default function EmployeePaySetupPage() {
    const { companyName } = useOwner();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    // ✅ Keyed by employeeNtid so only the row being saved shows a "Saving..." state
    const [savingNtid, setSavingNtid] = useState<string | null>(null);
    // ✅ Prefilled from each employee's maxHours when the backend sends one, otherwise 0
    const [maxHoursByNtid, setMaxHoursByNtid] = useState<Record<string, number>>({});

    useEffect(() => {
        if (!companyName) { return };
        setLoading(true);
        getEmployees(companyName)
            .then((data) => {
                setEmployees(data);
                setMaxHoursByNtid(
                    Object.fromEntries(data.map((emp) => [emp.employeeNtid, emp.maxHours ?? 0]))
                );
            })
            .catch((error) => console.error("❌ Failed to fetch employees:", error))
            .finally(() => setLoading(false));
    }, [companyName]);

    const handleChange = (index: number, field: "employeePayRatePerHour" | "commissionPercentage", value: string) => {
        const updated = [...employees];
        updated[index] = {
            ...updated[index],
            [field]: parseFloat(value)
        };
        setEmployees(updated);
    };

    const handleMaxHoursChange = (employeeNtid: string, value: string) => {
        setMaxHoursByNtid((prev) => ({ ...prev, [employeeNtid]: parseFloat(value) || 0 }));
    };

    const handleSave = async (employeeName: string, employeeNtid: string, payRate: number, commission: number, maxHours: number) => {
        setSavingNtid(employeeNtid);
        try {
            await apiClient.post(
                "/company/setupEmployeeHourlyPayAndMaximumHours",
                null, // ⬅️ No body, but POST still needs something here
                {
                    params: {
                        employeeNtid,
                        payRate,
                        commissionPercentage: commission,
                        hours: maxHours,
                    },
                }
            );

            toast.success(`Saved for ${employeeName}`);
        } catch (err) {
            toast.error(`Failed to save for ${employeeName}`);
            console.error(err);
        } finally {
            setSavingNtid(null);
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl sm:text-3xl font-bold mb-4">Employee Pay Setup</h1>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
                Setup hourly pay rate and commission percentage for your employees.
            </p>

            {loading ? (
                <p className="text-gray-500">Loading employees...</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg">
                        <thead className="bg-gray-100 dark:bg-gray-800">
                            <tr>
                                <th className="text-left p-3">Employee Name</th>
                                <th className="text-left p-3">Hourly Rate ($)</th>
                                <th className="text-left p-3">Commission (%)</th>
                                <th className="text-left p-3">Maximum Hours</th>
                                <th className="text-left p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((emp, index) => (
                                <tr key={emp.employeeNtid} className="border-t border-gray-200 dark:border-gray-700">
                                    <td className="p-3">{emp.employeeName}</td>
                                    <td className="p-3">
                                        <input
                                            type="number"
                                            value={emp.employeePayRatePerHour ?? ""}
                                            onChange={(e) => handleChange(index, "employeePayRatePerHour", e.target.value)}
                                            className="w-24 p-2 border rounded dark:bg-gray-800 dark:text-white"
                                        />
                                    </td>
                                    <td className="p-3">
                                        <input
                                            type="number"
                                            value={emp.commissionPercentage ?? ""}
                                            onChange={(e) => handleChange(index, "commissionPercentage", e.target.value)}
                                            className="w-24 p-2 border rounded dark:bg-gray-800 dark:text-white"
                                        />
                                    </td>
                                    <td className="p-3">
                                        <input
                                            type="number"
                                            value={maxHoursByNtid[emp.employeeNtid] ?? 0}
                                            onChange={(e) => handleMaxHoursChange(emp.employeeNtid, e.target.value)}
                                            className="w-24 p-2 border rounded dark:bg-gray-800 dark:text-white"
                                        />
                                    </td>
                                    <td className="p-3">
                                        <button
                                            onClick={() =>
                                                handleSave(
                                                    emp.employeeName,
                                                    emp.employeeNtid,
                                                    emp.employeePayRatePerHour,
                                                    emp.commissionPercentage,
                                                    maxHoursByNtid[emp.employeeNtid] ?? 0
                                                )
                                            }
                                            disabled={savingNtid === emp.employeeNtid}
                                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
                                        >
                                            {savingNtid === emp.employeeNtid ? "Saving..." : "Save"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
