
interface BoxCommissionSelectProps {
    value: string;
    onChange: (value: string) => void;
}

export function BoxCommissionSelect({ value, onChange }: BoxCommissionSelectProps) {
    return (
        <div>
            <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Box Commission Structure</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-800"
            >
                <option value="fixed">Fixed</option>
                <option value="tier">Tier-Based</option>
            </select>
        </div>
    );
}
