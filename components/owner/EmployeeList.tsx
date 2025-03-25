"use client";

interface Employee {
    dealerStoreId: string;
    employeeName: string;
    clockinTime: string;
    clockoutTime?: string;
}

interface EmployeeListProps {
    employees: Employee[];
}

export default function EmployeeList({ employees }: EmployeeListProps) {
    return (
        <div className="w-full p-4 bg-white dark:bg-gray-900 rounded-lg shadow-md">
            {/* ✅ Desktop View */}
            <div className="hidden md:block">
                <table className="w-full text-sm border-collapse border border-gray-300 dark:border-gray-700">
                    <thead className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-300 uppercase">
                        <tr>
                            <th className="p-3 text-left">Store</th>
                            <th className="p-3 text-left">Employee</th>
                            <th className="p-3 text-center">Clock-In</th>
                            <th className="p-3 text-center">Clock-Out</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {employees.map((employee, index) => (
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
                {employees.map((employee, index) => (
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
