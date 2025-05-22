import { TextareaHTMLAttributes, forwardRef } from "react";
import { twMerge } from "tailwind-merge";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ label, id, className, ...props }, ref) => {
    const textareaId = id || props.name;

    return (
        <div className="space-y-1">
            {label && (
                <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                </label>
            )}
            <textarea
                ref={ref}
                id={textareaId}
                rows={4}
                className={twMerge(
                    "w-full rounded-lg border border-gray-300 px-4 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:border-gray-700",
                    className
                )}
                {...props}
            />
        </div>
    );
});
Textarea.displayName = "Textarea";

export { Textarea };
