import React from "react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
    ({ label, error, ...props }, ref) => {
        return (
            <div className="flex flex-col space-y-2 w-full max-w-[28rem]"> {/* ✅ Wider Input Fields */}
                <label className="text-gray-800 dark:text-gray-200 text-sm font-semibold">
                    {label}
                </label>
                <input
                    ref={ref}
                    className={`px-4 py-3 w-full rounded-lg border shadow-sm transition placeholder-gray-500 focus:outline-none focus:ring-2 
                        bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600
                        ${error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"}`}
                    {...props}
                />
                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>
        );
    }
);

InputField.displayName = "InputField";
export default InputField;
