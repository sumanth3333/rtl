"use client";

export function FilterBar({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0e1729] shadow-sm p-3">
            {children}
        </div>
    );
}

export function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <label className="flex flex-col gap-1 text-xs">
            <span className="font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</span>
            {children}
        </label>
    );
}

const inputClasses =
    "rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500";

export function DateInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
    return (
        <input
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={inputClasses}
        />
    );
}

export function SelectInput({
    value,
    onChange,
    options,
    placeholder = "All",
}: {
    value: string;
    onChange: (value: string) => void;
    options: { label: string; value: string }[];
    placeholder?: string;
}) {
    return (
        <select value={value} onChange={(e) => onChange(e.target.value)} className={inputClasses}>
            <option value="">{placeholder}</option>
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    );
}
