"use client";

import { useState } from "react";
import GeneratePayFilter from "@/components/owner/paycheck/generate-pay/GeneratePayFilter";
import GeneratePayTable from "@/components/owner/paycheck/generate-pay/GeneratePayTable";

export default function GeneratePayPage() {
    const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [payrollData, setPayrollData] = useState<any[]>([]);

    const employees = [
        { id: "1", name: "John Doe" },
        { id: "2", name: "Jane Smith" },
        { id: "3", name: "Alice Johnson" },
    ]; // Replace with actual employee list

    const handleGeneratePay = () => {
        // ✅ Sample Data for Payroll
        setPayrollData([
            {
                employeeId: "1",
                employeeName: "John Doe",
                dateRange: `${startDate} to ${endDate}`,
                totalHours: 210,
                totalBoxes: 70,
                totalTablets: 16,
                totalHSI: 4,
                totalWatches: 3,
                totalAccessories: 4926,
                totalPay: 3456,
                salesHistory: [
                    { date: "01-01-25", hours: 8, boxes: 3, tablets: 1, hsi: 0, watches: 0, accessories: 150, pay: 120 },
                    { date: "01-02-25", hours: 9, boxes: 5, tablets: 2, hsi: 1, watches: 0, accessories: 200, pay: 140 },
                ],
            },
        ]);
    };

    return (
        <>
            <h1 className="text-3xl font-bold mb-6">Generate Pay</h1>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
                Select an **employee** (or all employees) and specify a **date range** to generate payroll.
            </p>

            {/* ✅ Generate Pay Filter */}
            <GeneratePayFilter
                employees={employees}
                selectedEmployee={selectedEmployee}
                setSelectedEmployee={setSelectedEmployee}
                startDate={startDate}
                endDate={endDate}
                setStartDate={setStartDate}
                setEndDate={setEndDate}
            />

            {/* ✅ Submit Button */}
            <button onClick={handleGeneratePay} className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md w-full md:w-auto">
                Generate Pay
            </button>

            {/* ✅ Payroll Table */}
            {payrollData.length > 0 && <GeneratePayTable employeesSalesData={payrollData} />}
        </>
    );
}
