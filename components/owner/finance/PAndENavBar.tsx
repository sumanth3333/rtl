"use client";

interface PAndENavBarProps {
    selectedMonth: string;
    setSelectedMonth: (month: string) => void;
}

export default function PAndENavBar({ selectedMonth, setSelectedMonth }: PAndENavBarProps) {
    return (
        <nav className="bg-gray-100 dark:bg-gray-800 px-4 py-4 rounded-2xl shadow-lg flex flex-col gap-6 md:flex-row md:justify-between md:items-center">
            {/* Title */}
            <p className="text-center md:text-left text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">Profits & Expenses
            </p>

            {/* Month Picker */}
            <div className="flex flex-col sm:flex-row justify-center md:justify-end items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    Select Month:
                </label>
                <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full sm:w-auto"
                />
            </div>

            {/* Navigation Links */}
            <div className="flex flex-col sm:flex-row justify-center md:justify-end items-center gap-3 sm:gap-4">
                {[
                    { name: "Expenses", href: "/dashboard/owner/finance" },
                    { name: "Update Compensation", href: "/dashboard/owner/finance/compensation" },
                    { name: "Profit Lookup", href: "/dashboard/owner/finance/profit" }
                ].map((link) => (
                    <a
                        key={link.name}
                        href={link.href}
                        className="px-4 py-2 rounded-full text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 dark:from-blue-400 dark:to-blue-500 dark:hover:from-blue-500 dark:hover:to-blue-600 shadow-md transition-all duration-200 ease-in-out"
                    >
                        {link.name}
                    </a>
                ))}
            </div>
        </nav>
    );
}
