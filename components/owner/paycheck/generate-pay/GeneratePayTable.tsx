"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

interface EmployeeSales {
    employeeId: string;
    employeeName: string;
    dateRange: string;
    totalHours: number;
    totalBoxes: number;
    totalTablets: number;
    totalHSI: number;
    totalWatches: number;
    totalAccessories: number;
    totalPay: number;
    salesHistory: {
        date: string;
        hours: number;
        boxes: number;
        tablets: number;
        hsi: number;
        watches: number;
        accessories: number;
        pay: number;
    }[];
}

interface GeneratePayTableProps {
    employeesSalesData: EmployeeSales[];
}

export default function GeneratePayTable({ employeesSalesData }: GeneratePayTableProps) {
    const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);

    const toggleExpand = (employeeId: string) => {
        setExpandedEmployee(expandedEmployee === employeeId ? null : employeeId);
    };

    return (
        <div className="w-full mt-8 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-300 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-200 mb-4">Payroll Summary</h2>

            <div className="divide-y divide-gray-300 dark:divide-gray-700">
                {employeesSalesData.map((employee) => (
                    <div key={employee.employeeId} className="py-4">
                        {/* ✅ Employee Summary Row */}
                        <button
                            onClick={() => toggleExpand(employee.employeeId)}
                            className="w-full flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                        >
                            <div className="text-lg font-medium text-gray-900 dark:text-gray-200">
                                {employee.employeeName} <span className="text-gray-500 dark:text-gray-400">({employee.dateRange})</span>
                            </div>
                            {expandedEmployee === employee.employeeId ? (
                                <ChevronUpIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                            ) : (
                                <ChevronDownIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                            )}
                        </button>

                        {/* ✅ Summary Details */}
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 text-gray-800 dark:text-gray-300 mt-3 px-4">
                            <p><strong>Total Hours:</strong> {employee.totalHours}</p>
                            <p><strong>Total Boxes:</strong> {employee.totalBoxes}</p>
                            <p><strong>Total BTS:</strong> {employee.totalTablets}</p>
                            <p><strong>HSI:</strong> {employee.totalHSI}</p>
                            <p><strong>Free Lines:</strong> {employee.totalWatches}</p>
                            <p><strong>Total Accessories:</strong> ${employee.totalAccessories}</p>
                            <p><strong>Total Pay:</strong> ${employee.totalPay}</p>
                        </div>

                        {/* ✅ Expanded Sales History */}
                        {expandedEmployee === employee.employeeId && (
                            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-inner">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-3">
                                    Sales History
                                </h3>
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                        <tr>
                                            <th className="p-3">Date</th>
                                            <th className="p-3">Hours</th>
                                            <th className="p-3">Boxes</th>
                                            <th className="p-3">BTS</th>
                                            <th className="p-3">HSI</th>
                                            <th className="p-3">Free Lines</th>
                                            <th className="p-3">Accessories ($)</th>
                                            <th className="p-3">Pay ($)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {employee.salesHistory.map((sale, index) => (
                                            <tr key={index} className="border-t border-gray-300 dark:border-gray-700">
                                                <td className="p-3">{sale.date}</td>
                                                <td className="p-3">{sale.hours}</td>
                                                <td className="p-3">{sale.boxes}</td>
                                                <td className="p-3">{sale.tablets}</td>
                                                <td className="p-3">{sale.hsi}</td>
                                                <td className="p-3">{sale.watches}</td>
                                                <td className="p-3">${sale.accessories}</td>
                                                <td className="p-3 font-semibold text-green-600 dark:text-green-400">${sale.pay}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
