import { BanknotesIcon, CreditCardIcon, CurrencyDollarIcon, CubeIcon } from "@heroicons/react/24/outline";
import CashSummaryCard from "./CashSummaryCard";

export default function CashSummary({ cash }: { cash: any }) {
    const summaryItems = [
        { title: "Actual Cash", value: cash.actualCash, icon: <CurrencyDollarIcon className="w-6 h-6" />, color: "text-green-600 dark:text-green-400" },
        { title: "System Cash", value: cash.systemCash, icon: <CurrencyDollarIcon className="w-6 h-6" />, color: "text-gray-600 dark:text-gray-400" },
        { title: "Actual Card", value: cash.actualCard, icon: <CreditCardIcon className="w-6 h-6" />, color: "text-blue-600 dark:text-blue-400" },
        { title: "System Card", value: cash.systemCard, icon: <CreditCardIcon className="w-6 h-6" />, color: "text-gray-600 dark:text-gray-400" },
        { title: "Cash Accessories", value: cash.cashAccessories, icon: <CubeIcon className="w-6 h-6" />, color: "text-purple-600 dark:text-purple-400" },
        { title: "System Accessories", value: cash.systemAccessories, icon: <CubeIcon className="w-6 h-6" />, color: "text-gray-600 dark:text-gray-400" },
        { title: "Card Accessories", value: cash.cardAccessories, icon: <CreditCardIcon className="w-6 h-6" />, color: "text-indigo-600 dark:text-indigo-400" }
    ];

    return (
        <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md mt-4">
            <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <BanknotesIcon className="w-6 h-6 text-green-500 mr-2" /> Cash & Card Summary
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {summaryItems.map((item, index) => (
                    <CashSummaryCard key={index} icon={item.icon} title={item.title} value={item.value} color={item.color} />
                ))}
            </div>
        </div>
    );
}
