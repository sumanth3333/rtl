"use client";

interface PAndENavBarProps {
    selectedMonth: string;
    setSelectedMonth: (month: string) => void;
}

export default function PAndENavBar({ selectedMonth, setSelectedMonth }: PAndENavBarProps) {
    return (
        <nav className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">💰 Profits & Expenses</h2>

            {/* Month Picker */}
            <div className="flex items-center gap-2">
                <label className="text-gray-700 dark:text-gray-300 text-sm font-medium">Select Month:</label>
                <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="p-2 border rounded-md bg-white dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Navigation Links */}
            <div className="flex gap-4">
                <a href="/dashboard/owner/finance/expenses" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
                    Expenses
                </a>
                <a href="/dashboard/owner/finance/compensation" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
                    Update Compensation
                </a>
                <a href="/dashboard/owner/finance/profit" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
                    Profit Lookup
                </a>
            </div>
        </nav>
    );
}
