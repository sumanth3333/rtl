import { ReactNode } from "react";

interface CashSummaryCardProps {
    icon: ReactNode;
    title: string;
    value: number;
    color: string;
}

export default function CashSummaryCard({ icon, title, value, color }: CashSummaryCardProps) {
    return (
        <div className="p-1 sm:p-2 lg:p-3 bg-white dark:bg-gray-900 rounded-lg shadow-md flex flex-col items-center justify-center text-center">
            <div className={`flex items-center justify-center ${color}`}>
                {icon}
            </div>
            <h5 className="mt-1 text-xs sm:text-sm md:text-base font-semibold text-gray-700 dark:text-gray-300">{title}</h5>
            <p className="text-sm sm:text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100">${value.toFixed(2)}</p>
        </div>
    );
}
