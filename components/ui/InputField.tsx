import React from "react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
    ({ label, error, ...props }, ref) => {
        return (
            <div className="flex flex-col space-y-1 w-full max-w-full sm:max-w-[28rem]">
                <label className="text-gray-800 dark:text-gray-200 text-xs sm:text-sm font-semibold">
                    {label}
                </label>
                <input
                    ref={ref}
                    className={`w-full rounded-lg border shadow-sm transition-all placeholder-gray-500 
            bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600
            hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-opacity-40
            ${error
                            ? "border-red-500 focus:ring-red-500 dark:focus:ring-red-400"
                            : "border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-400"}
            px-3 py-2 sm:px-4 sm:py-3`}
                    {...props}
                />
                {error && (
                    <p className="text-red-500 text-xs mt-1 animate-fade-in">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

InputField.displayName = "InputField";
export default InputField;
