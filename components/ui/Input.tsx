import { InputHTMLAttributes, forwardRef } from "react";
import { twMerge } from "tailwind-merge";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ label, id, className, ...props }, ref) => {
    const inputId = id || props.name;

    return (
        <div className="space-y-1">
            {label && (
                <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                </label>
            )}
            <input
                ref={ref}
                id={inputId}
                className={twMerge(
                    "w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:border-gray-700",
                    className
                )}
                {...props}
            />
        </div>
    );
});
Input.displayName = "Input";

export { Input };
