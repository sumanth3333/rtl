import React from "react";
import { ArrowRightIcon, ExclamationCircleIcon, XCircleIcon, LockClosedIcon, CurrencyDollarIcon } from "@heroicons/react/24/solid"; // ✅ Import relevant Heroicons

interface ButtonProps {
    text: string;
    onClick?: () => void;
    type?: "button" | "submit";
    isLoading?: boolean;
    variant?: "primary" | "secondary" | "danger" | "black" | "darkTeal";
    className?: string;
}

// ✅ Assign the correct Heroicon based on the button purpose
const iconMap = {
    primary: <ArrowRightIcon className="w-5 h-5" />,  // ✅ Main action
    secondary: <ExclamationCircleIcon className="w-5 h-5" />, // ✅ Secondary warnings/info
    danger: <XCircleIcon className="w-5 h-5" />, // ✅ Dangerous actions (delete/logout)
    black: <LockClosedIcon className="w-5 h-5" />, // 🔒 ✅ Login Button (Black)
    darkTeal: <CurrencyDollarIcon className="w-5 h-5" />, // ✅ Dark Teal Button (Finance/Payment)
};


export default function Button({ text, onClick, type = "button", isLoading = false, variant = "primary", className }: ButtonProps) {
    const baseClass = "px-5 py-3 rounded-lg font-semibold text-sm flex items-center justify-center space-x-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2";
    const variantClass = {
        primary: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-400 text-white shadow-md hover:shadow-lg",
        secondary: "bg-gray-600 hover:bg-gray-700 focus:ring-gray-400 text-white shadow-md hover:shadow-lg",
        danger: "bg-red-600 hover:bg-red-700 focus:ring-red-400 text-white shadow-md hover:shadow-lg",
        black: "bg-black hover:bg-gray-800 focus:ring-gray-600 text-white shadow-md hover:shadow-lg", // ✅ Black Button
        darkTeal: "bg-teal-700 hover:bg-teal-800 focus:ring-teal-500 text-white shadow-md hover:shadow-lg", // ✅ Dark Teal Button
    };

    return (
        <button
            onClick={onClick}
            type={type}
            disabled={isLoading}
            className={`${baseClass} ${variantClass[variant]} ${className}`}
        >
            {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full"></span>
                    <span>Processing...</span>
                </div>
            ) : (
                <div className="flex items-center space-x-2">
                    {iconMap[variant]} {/* ✅ Dynamically assign the correct icon */}
                    <span>{text}</span>
                </div>
            )}
        </button>
    );
}
