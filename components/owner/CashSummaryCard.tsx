import { ReactNode } from "react";

interface CashSummaryCardProps {
    icon: ReactNode;
    title: string;
    value: number;
    color: string;
}

export default function CashSummaryCard({ icon, title, value, color }: CashSummaryCardProps) {
    return (
        <div className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow">
            <div className={`flex items-center ${color}`}>
                {icon}
                <h5 className="font-semibold ml-2">{title}</h5>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">${value.toFixed(2)}</p>
        </div>
    );
}
