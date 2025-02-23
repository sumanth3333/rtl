import React from "react";
import {
    Loader2, ArrowRight, AlertTriangle, XCircle, Lock, DollarSign, CheckCircle, AlertCircle, Zap,
} from "lucide-react";

interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    type?: "button" | "submit";
    isLoading?: boolean;
    variant?: "primary" | "secondary" | "danger" | "success" | "warning" | "darkTeal" | "black" | "outline" | "gradient" | "glass";
    className?: string;
    fullWidth?: boolean;
    disabled?: boolean;
}

const iconMap = {
    primary: <ArrowRight className="w-5 h-5" />,
    secondary: <AlertCircle className="w-5 h-5" />,
    danger: <XCircle className="w-5 h-5" />,
    success: <CheckCircle className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    black: <Lock className="w-5 h-5" />,
    darkTeal: <DollarSign className="w-5 h-5" />,
    outline: <Zap className="w-5 h-5" />,
    gradient: <ArrowRight className="w-5 h-5" />,
    glass: <Zap className="w-5 h-5" />,
};

export default function Button({
    children,
    onClick,
    type = "button",
    isLoading = false,
    variant = "primary",
    className = "",
    fullWidth = false,
    disabled = false,
}: ButtonProps) {
    const baseClass =
        "px-5 py-3 rounded-lg font-semibold text-sm flex items-center justify-center space-x-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2";

    const variantClass = {
        primary: "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-400 text-white shadow-lg hover:shadow-xl active:scale-95",
        secondary: "bg-gray-700 hover:bg-gray-800 focus:ring-gray-500 text-white shadow-lg hover:shadow-xl active:scale-95",
        danger: "bg-rose-600 hover:bg-rose-700 focus:ring-rose-400 text-white shadow-lg hover:shadow-xl active:scale-95",
        success: "bg-green-600 hover:bg-green-700 focus:ring-green-400 text-white shadow-lg hover:shadow-xl active:scale-95",
        warning: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-400 text-white shadow-lg hover:shadow-xl active:scale-95",
        black: "bg-black hover:bg-gray-900 focus:ring-gray-600 text-white shadow-lg hover:shadow-xl active:scale-95",
        darkTeal: "bg-teal-700 hover:bg-teal-800 focus:ring-teal-500 text-white shadow-lg hover:shadow-xl active:scale-95",
        outline: "border border-gray-500 text-gray-800 hover:bg-gray-100 focus:ring-gray-300",
        gradient: "bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-90 text-white shadow-lg hover:shadow-xl active:scale-95",
        glass: "bg-white bg-opacity-20 backdrop-blur-lg border border-white text-white hover:bg-opacity-30 focus:ring-white",
    };

    return (
        <button
            onClick={onClick}
            type={type}
            disabled={isLoading || disabled}
            aria-label={isLoading ? "Loading..." : undefined}
            className={`${baseClass} ${variantClass[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
        >
            {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                    <span>Processing...</span>
                </div>
            ) : (
                <div className="flex items-center space-x-2">
                    {iconMap[variant]}
                    <span>{children}</span>
                </div>
            )}
        </button>
    );
}
