"use client";

import { CalendarIcon, UserIcon } from "@heroicons/react/24/outline";
import FilterInput from "../../FilterInput";

interface GeneratePayFilterProps {
    employees: { id: string; name: string }[];
    selectedEmployee: string;
    startDate: string;
    endDate: string;
    setSelectedEmployee: (employee: string) => void;
    setStartDate: (date: string) => void;
    setEndDate: (date: string) => void;
}

export default function GeneratePayFilter({
    employees,
    selectedEmployee,
    startDate,
    endDate,
    setSelectedEmployee,
    setStartDate,
    setEndDate,
}: GeneratePayFilterProps) {
    return (
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-4">
                Please select an employee and date range
            </h3>

            {/* ✅ Responsive Grid Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {/* Employee Selection */}
                <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Select Employee</label>
                    <div className="relative">
                        <UserIcon className="w-5 h-5 text-blue-500 absolute left-3 top-3" />
                        <select
                            value={selectedEmployee}
                            onChange={(e) => setSelectedEmployee(e.target.value)}
                            className="w-full p-3 pl-10 border rounded-md bg-gray-50 dark:bg-gray-800 dark:text-gray-300"
                        >
                            <option value="all">All Employees</option>
                            {employees.map((employee) => (
                                <option key={employee.id} value={employee.id}>
                                    {employee.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Start Date */}
                <FilterInput
                    label="Start Date"
                    value={startDate}
                    onChange={setStartDate}
                    type="date"
                    icon={<CalendarIcon className="w-5 h-5 text-green-500" />}
                />

                {/* End Date */}
                <FilterInput
                    label="End Date"
                    value={endDate}
                    onChange={setEndDate}
                    type="date"
                    icon={<CalendarIcon className="w-5 h-5 text-red-500" />}
                />
            </div>
        </div>
    );
}
