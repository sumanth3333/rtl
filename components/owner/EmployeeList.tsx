"use client";

import { useMemo, useState } from "react";

interface Employee {
    dealerStoreId: string;
    employeeName: string;
    clockinTime: string;
    clockoutTime?: string;
}

type SortKey = "dealerStoreId" | "clockinTime";
type SortDirection = "asc" | "desc";

interface EmployeeListProps {
    employees: Employee[];
}

function parseClockTime(value: string) {
    // Attempt to parse times like "09:15", "09:15:30" or "09:15 AM"; fall back to lexical compare weight
    const normalized = value?.trim();
    if (!normalized) return null;

    // Handle AM/PM
    const ampmMatch = normalized.match(/^(\d{1,2}:\d{2})(?::\d{2})?\s?(AM|PM)$/i);
    if (ampmMatch) {
        const [time, meridiem] = [ampmMatch[1], ampmMatch[2].toUpperCase()];
        const [h, m] = time.split(":").map(Number);
        const hour24 = (h % 12) + (meridiem === "PM" ? 12 : 0);
        return hour24 * 60 + m;
    }

    // Handle HH:mm or HH:mm:ss
    const parts = normalized.split(":").map((p) => Number(p));
    if (parts.length >= 2 && parts.every((n) => Number.isFinite(n))) {
        const [h, m, s = 0] = parts;
        return h * 3600 + m * 60 + s;
    }

    return null;
}

export default function EmployeeList({ employees }: EmployeeListProps) {
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: "dealerStoreId", direction: "asc" });

    const sortedEmployees = useMemo(() => {
        const list = [...employees];
        const { key, direction } = sortConfig;

        return list.sort((a, b) => {
            if (key === "dealerStoreId") {
                const result = a.dealerStoreId.localeCompare(b.dealerStoreId);
                return direction === "asc" ? result : -result;
            }

            const aVal = parseClockTime(a.clockinTime);
            const bVal = parseClockTime(b.clockinTime);

            if (aVal !== null && bVal !== null) {
                const result = aVal - bVal;
                return direction === "asc" ? result : -result;
            }

            // Fallback to string compare when parsing fails
            const result = a.clockinTime.localeCompare(b.clockinTime);
            return direction === "asc" ? result : -result;
        });
    }, [employees, sortConfig]);

    const toggleSort = (key: SortKey) => {
        setSortConfig((prev) =>
            prev.key === key
                ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
                : { key, direction: "asc" }
        );
    };

    const indicator = (key: SortKey) => {
        if (sortConfig.key !== key) return "";
        return sortConfig.direction === "asc" ? "▲" : "▼";
    };
    return (
        <div className="w-full p-4 bg-white dark:bg-gray-900 rounded-lg shadow-md">
            {/* ✅ Desktop View */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900 text-white text-sm">
                        📍
                    </span>
                    <div className="leading-tight">
                        <p className="text-sm font-semibold text-zinc-900">Who is Working </p>

                    </div>
                </div>

            </div>
            <div className="hidden md:block">
                <table className="w-full text-sm border-collapse border border-gray-300 dark:border-gray-700">
                    <thead className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-300 uppercase">
                        <tr>
                            <th
                                className="p-3 text-left cursor-pointer select-none"
                                onClick={() => toggleSort("dealerStoreId")}
                                title="Sort by store"
                            >
                                Store {indicator("dealerStoreId")}
                            </th>
                            <th className="p-3 text-left">Employee</th>
                            <th
                                className="p-3 text-center cursor-pointer select-none"
                                onClick={() => toggleSort("clockinTime")}
                                title="Sort by clock-in time"
                            >
                                Clock-In {indicator("clockinTime")}
                            </th>
                            <th className="p-3 text-center">Clock-Out</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {sortedEmployees.map((employee, index) => (
                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                                <td className="p-3 font-semibold text-gray-900 dark:text-white">
                                    {employee.dealerStoreId}
                                </td>
                                <td className="p-3 text-gray-700 dark:text-gray-300">
                                    {employee.employeeName}
                                </td>
                                <td className="p-3 text-center text-blue-600 dark:text-blue-400 font-semibold">
                                    {employee.clockinTime}
                                </td>
                                <td className={`p-3 text-center font-semibold ${employee.clockoutTime
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-yellow-500 dark:text-yellow-400"
                                    }`}>
                                    {employee.clockoutTime || "Currently Working"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ✅ Mobile View */}
            <div className="md:hidden flex flex-col gap-2">
                {sortedEmployees.map((employee, index) => (
                    <div
                        key={index}
                        className="p-3 bg-gray-50 dark:bg-gray-800 border-l-4 border-blue-500 dark:border-blue-400 rounded-md shadow-sm flex flex-col"
                    >
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>Store</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {employee.dealerStoreId}
                            </span>
                        </div>

                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>Employee</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {employee.employeeName}
                            </span>
                        </div>

                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>Clock-In</span>
                            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                {employee.clockinTime}
                            </span>
                        </div>

                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>Clock-Out</span>
                            <span className={`text-sm font-semibold ${employee.clockoutTime
                                ? "text-green-600 dark:text-green-400"
                                : "text-yellow-500 dark:text-yellow-400"
                                }`}>
                                {employee.clockoutTime || "Currently Working"}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
