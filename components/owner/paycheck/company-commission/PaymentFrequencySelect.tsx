"use client";

interface PaymentFrequencySelectProps {
    value: string;
    onChange: (value: string) => void;
}

export function PaymentFrequencySelect({ value, onChange }: PaymentFrequencySelectProps) {
    return (
        <div>
            <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Select Payment Frequency</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-800"
            >
                <option value="weekly">Weekly</option>
                <option value="biweekly">Twice a Month</option>
                <option value="monthly">Monthly</option>
            </select>
        </div>
    );
}
