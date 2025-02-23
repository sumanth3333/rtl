import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";

interface TableHeaderProps {
    headers: { key: string; label: string }[];
    sortedField: string | null;
    ascending: boolean;
    onSort: (key: string) => void;
}

export default function TableHeader({ headers, sortedField, ascending, onSort }: TableHeaderProps) {
    return (
        <tr className="bg-gray-700 text-white">
            {headers.map(({ key, label }) => (
                <th
                    key={key}
                    className="border px-4 py-3 cursor-pointer select-none text-left"
                    onClick={() => onSort(key)}
                >
                    {/* ✅ Wrap content inside a div to ensure flex positioning */}
                    <div className="flex items-center justify-between">
                        <span>{label}</span>
                        {sortedField === key ? (
                            ascending ? <ArrowUpIcon className="w-4 h-4 ml-2" /> : <ArrowDownIcon className="w-4 h-4 ml-2" />
                        ) : null}
                    </div>
                </th>
            ))}
        </tr>
    );
}
