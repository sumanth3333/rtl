"use client";

import { useState } from "react";
import { useFetchElbScorecard } from "@/hooks/useFetchElbScorecard";
import ElbMetricCell from "./ElbMetricCell";

interface ElbScorecardProps {
    companyName: string;
}

export default function ElbScorecard({ companyName }: ElbScorecardProps) {
    const { data, isLoading, error } = useFetchElbScorecard(companyName);
    const [selectedType, setSelectedType] = useState<"stores" | "employees">("stores");

    if (isLoading) {
        return <p className="text-gray-500 text-center">Loading ELB Scorecard...</p>;
    }
    if (error) {
        return <p className="text-red-500 text-center">Error: {error}</p>;
    }

    const storeData = data.filter((entry) => "store" in entry) as any[];
    const employeeData = data.filter((entry) => "employee" in entry) as any[];

    return (
        <div className="bg-white dark:bg-gray-900 p-3 md:p-4 rounded-lg shadow-md">
            {/* Toggle View */}
            <div className="flex justify-center mb-3">
                {["stores", "employees"].map((type) => (
                    <button
                        key={type}
                        className={`px-3 py-1 mx-1 text-sm rounded-md transition ${selectedType === type
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white"
                            }`}
                        onClick={() => setSelectedType(type as "stores" | "employees")}
                    >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
                {selectedType === "stores" && (
                    <table className="w-full text-sm border-collapse border border-gray-300 dark:border-gray-700">
                        <thead className="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-300">
                            <tr>
                                <th className="p-2 text-left">Store Name</th>
                                {["Activations", "Upgrades", "Accessories ($)", "HSI", "Tablets", "Smartwatches"].map((label) => (
                                    <th key={label} className="p-2 text-center">{label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {storeData.map((store, index) => {
                                const [total = {}, achieved = {}, remaining = {}] = Array.isArray(store.storeMTD) && store.storeMTD.length === 3
                                    ? store.storeMTD
                                    : [{}, {}, {}];

                                return (
                                    <tr
                                        key={index}
                                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    >
                                        <td className="p-2 font-semibold">{store.store?.storeName ?? "N/A"}</td>
                                        {[
                                            "activationTargetToStore",
                                            "upgradeTargetToStore",
                                            "accessoriesTargetToStore",
                                            "hsiTargetToStore",
                                            "tabletsTargetToStore",
                                            "smartwatchTragetToStore",
                                        ].map((key) => (
                                            <ElbMetricCell
                                                key={key}
                                                achieved={achieved?.[key] ?? 0}
                                                total={total?.[key] ?? 0}
                                                remaining={remaining?.[key] ?? 0}
                                            />
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}

                {selectedType === "employees" && (
                    <table className="w-full text-sm border-collapse border border-gray-300 dark:border-gray-700">
                        <thead className="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-300">
                            <tr>
                                <th className="p-2 text-left">Employee Name</th>
                                {["Activations", "Upgrades", "Accessories ($)", "HSI", "Tablets", "Smartwatches"].map((label) => (
                                    <th key={label} className="p-2 text-center">{label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {employeeData.map((employee, index) => {
                                const [total = {}, achieved = {}, remaining = {}] = Array.isArray(employee.employeeMTD) && employee.employeeMTD.length === 3
                                    ? employee.employeeMTD
                                    : [{}, {}, {}];

                                return (
                                    <tr
                                        key={index}
                                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    >
                                        <td className="p-2 font-semibold">{employee.employee?.employeeName ?? "N/A"}</td>
                                        {[
                                            "phonesTargetToEmployee",
                                            "upgradeTargetToEmployee",
                                            "accessoriesTargetByEmployee",
                                            "hsiTarget",
                                            "tabletsTargetByEmployee",
                                            "smartwatchTargetByEmployee",
                                        ].map((key) => (
                                            <ElbMetricCell
                                                key={key}
                                                achieved={achieved?.[key] ?? 0}
                                                total={total?.[key] ?? 0}
                                                remaining={remaining?.[key] ?? 0}
                                            />
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>


            {/* Mobile View (Optimized for Phones) */}
            <div className="md:hidden space-y-2">
                {selectedType === "stores" &&
                    storeData.map((store, index) => {
                        const [total = {}, achieved = {}, remaining = {}] = store.storeMTD || [];

                        return (
                            <div key={index} className="p-3 bg-white dark:bg-gray-800 rounded-md shadow-sm border-l-4 border-blue-500 dark:border-blue-400">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{store.store.storeName}</h3>
                                {[
                                    { label: "Activations", key: "activationTargetToStore" },
                                    { label: "Accessories ($)", key: "accessoriesTargetToStore" },
                                    { label: "HSI", key: "hsiTargetToStore" },
                                    { label: "Tablets", key: "tabletsTargetToStore" },
                                    { label: "Smartwatches", key: "smartwatchTragetToStore" },
                                ].map(({ label, key }) => (
                                    <div key={key} className="flex justify-between text-xs">
                                        <span className="text-gray-600 dark:text-gray-300">{label}</span>
                                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                                            {achieved[key] ?? 0} / {total[key] ?? 0}
                                            <span className={`ml-1 text-xs ${(remaining[key] ?? 0) < 0 ? "text-green-600" : "text-red-500"}`}>
                                                {(remaining[key] ?? 0) < 0 ? `+${Math.abs(remaining[key])}` : `-${remaining[key] ?? 0}`}
                                            </span>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        );
                    })}

                {selectedType === "employees" &&
                    employeeData.map((employee, index) => {
                        const [total = {}, achieved = {}, remaining = {}] = Array.isArray(employee.employeeMTD) && employee.employeeMTD.length >= 3
                            ? employee.employeeMTD
                            : [{}, {}, {}];

                        return (
                            <div
                                key={index}
                                className="p-3 bg-white dark:bg-gray-800 rounded-md shadow-sm border-l-4 border-green-500 dark:border-green-400"
                            >
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                                    {employee.employee?.employeeName ?? "N/A"}
                                </h3>
                                {[
                                    { label: "Phones", key: "phonesTargetToEmployee" },
                                    { label: "Accessories ($)", key: "accessoriesTargetByEmployee" },
                                    { label: "HSI", key: "hsiTarget" },
                                    { label: "Tablets", key: "tabletsTargetByEmployee" },
                                    { label: "Smartwatches", key: "smartwatchTargetByEmployee" },
                                ].map(({ label, key }) => (
                                    <div key={key} className="flex justify-between text-xs">
                                        <span className="text-gray-600 dark:text-gray-300">{label}</span>
                                        <span className="font-semibold text-green-600 dark:text-green-400">
                                            {achieved?.[key] ?? 0} / {total?.[key] ?? 0}
                                            <span
                                                className={`ml-1 text-xs ${(remaining?.[key] ?? 0) < 0
                                                    ? "text-green-600"
                                                    : "text-red-500"
                                                    }`}
                                            >
                                                {(remaining?.[key] ?? 0) < 0
                                                    ? `+${Math.abs(remaining?.[key])}`
                                                    : `-${remaining?.[key] ?? 0}`}
                                            </span>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        );
                    })}


            </div>
        </div>
    );
}
