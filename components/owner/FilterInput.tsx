import { ReactNode } from "react";

interface FilterInputProps {
    label: string;
    value: string;
    onChange?: (value: string) => void;
    type?: "text" | "date";
    disabled?: boolean;
    icon?: ReactNode;
}

export default function FilterInput({ label, value, onChange, type = "text", disabled, icon }: FilterInputProps) {
    return (
        <div className="flex flex-col">
            <label className="text-gray-700 dark:text-gray-300 font-medium flex items-center">
                {icon && <span className="mr-2">{icon}</span>}
                {label}
            </label>
            <input
                type={type}
                value={value}
                onChange={onChange ? (e) => onChange(e.target.value) : undefined}
                disabled={disabled}
                className="w-full border rounded-lg px-4 py-2 bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            />
        </div>
    );
}
