import { PayFrequency } from "@/types/companyTypes";

interface PayFrequencySelectProps {
    selected: PayFrequency;
    onChange: (value: PayFrequency) => void;
}

export default function PayFrequencySelect({ selected, onChange }: PayFrequencySelectProps) {
    return (
        <div className="mt-6">
            <label className="block text-gray-800 dark:text-gray-300 font-semibold">Payment Frequency</label>
            <select
                value={selected}
                onChange={(e) => onChange(e.target.value as PayFrequency)}
                className="p-3 border rounded-lg w-full max-w-md bg-white dark:bg-gray-800 dark:text-gray-200"
            >
                <option value="WEEKLY">Weekly</option>
                <option value="BIWEEKLY">Bi-Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="SEMI_MONTHLY">Semi-Monthly (1st & 15th)</option>
            </select>
        </div>
    );
}
