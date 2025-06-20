"use client";

import { useEffect, useState } from "react";
import { getWhoIsWorking } from "@/services/owner/ownerService";
import apiClient from "@/services/api/apiClient";
import { toast } from "react-toastify";

interface WorkingEmployee {
    employeeNtid: string;
    employeeName: string;
    currentStore: string;
}

interface Props {
    companyName: string;
}

export default function ChangeEmployeeStore({ companyName }: Props) {
    const [workingEmployees, setWorkingEmployees] = useState<WorkingEmployee[]>([]);
    const [loading, setLoading] = useState(true);
    const [changes, setChanges] = useState<Record<string, string>>({});
    const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);

    useEffect(() => {
        if (!companyName) { return };
        getWhoIsWorking(companyName)
            .then((data) => setWorkingEmployees(data))
            .catch(() => toast.error("Failed to load working employees."))
            .finally(() => setLoading(false));
    }, [companyName]);

    const handleStoreChange = (employeeNtid: string, store: string) => {
        setChanges((prev) => ({ ...prev, [employeeNtid]: store }));
    };

    const handleSave = async (employeeNtid: string) => {
        const newStore = changes[employeeNtid];
        if (!newStore || !selectedDate) { return };

        try {
            await apiClient.post(`/store/changeEmployeeWorkingStore`, null, {
                params: {
                    dealerStoreId: newStore,
                    employeeNtid,
                    date: selectedDate,
                },
            });
            toast.success(`Updated store for ${employeeNtid}`);
        } catch (err) {
            console.error(err);
            toast.error(`Failed to update store for ${employeeNtid}`);
        }
    };

    if (loading) {
        return <p className="text-gray-500 dark:text-gray-300">Loading...</p>;
    }

    return (
        <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-700 shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Change Employee Working Store
            </h2>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Select Date
                </label>
                <input
                    type="date"
                    value={selectedDate}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full sm:w-64 p-2 border rounded bg-white dark:bg-gray-800 dark:text-white"
                />
            </div>

            <div className="overflow-x-auto">
                <table className="w-full table-auto text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white">
                        <tr>
                            <th className="p-2 text-left">Employee</th>
                            <th className="p-2 text-left">Current Store</th>
                            <th className="p-2 text-left">New Store</th>
                            <th className="p-2 text-left">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {workingEmployees.map((emp, index) => (
                            <tr
                                key={emp.employeeNtid || `emp-${index}`} // fallback if ID is missing
                                className="border-t border-gray-200 dark:border-gray-600"
                            >
                                <td className="p-2">{emp.employeeName}</td>
                                <td className="p-2 text-blue-600 font-medium">{emp.currentStore}</td>
                                <td className="p-2">
                                    <input
                                        type="text"
                                        value={changes[emp.employeeNtid] || ""}
                                        onChange={(e) =>
                                            handleStoreChange(emp.employeeNtid, e.target.value)
                                        }
                                        className="w-full sm:w-48 p-1 border rounded bg-white dark:bg-gray-800 dark:text-white"
                                        placeholder="New Store ID"
                                    />
                                </td>
                                <td className="p-2">
                                    <button
                                        onClick={() => handleSave(emp.employeeNtid)}
                                        disabled={!changes[emp.employeeNtid]}
                                        className={`px-3 py-1 rounded text-white ${changes[emp.employeeNtid]
                                            ? "bg-blue-600 hover:bg-blue-700"
                                            : "bg-gray-400 cursor-not-allowed"
                                            }`}
                                    >
                                        Save
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>

                </table>
            </div>
        </div>
    );
}
