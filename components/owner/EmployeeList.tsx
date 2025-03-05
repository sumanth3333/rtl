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
        <div className="w-full overflow-x-auto md:overflow-visible">
            <table className="w-full border-collapse text-sm text-left bg-white dark:bg-gray-900 shadow-lg rounded-lg overflow-hidden">
                <thead className="bg-gradient-to-r from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900 text-gray-700 dark:text-gray-300 text-sm md:text-base uppercase">
                    <tr>
                        <th className="px-6 py-4 text-left font-semibold">Store ID</th>
                        <th className="px-6 py-4 text-left font-semibold">Employee Name</th>
                        <th className="px-6 py-4 text-left font-semibold">Clock-In Time</th>
                        <th className="px-6 py-4 text-left font-semibold">Clock-Out Time</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {employees.map((employee, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300">
                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{employee.dealerStoreId}</td>
                            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{employee.employeeName}</td>
                            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{employee.clockinTime}</td>
                            <td className="px-6 py-4 text-green-600 dark:text-green-400 font-semibold">{employee.clockoutTime || "Currently Working"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}