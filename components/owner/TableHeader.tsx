import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";

interface TableHeaderProps {
    headers: { key: string; label: string }[];
    sortedField: string | null;
    ascending: boolean;
    onSort: (key: string) => void;
}

export default function TableHeader({ headers, sortedField, ascending, onSort }: TableHeaderProps) {
    return (
        <tr className="bg-gray-700 text-white text-xs sm:text-sm md:text-base">
            {headers.map(({ key, label }) => (
                <th
                    key={key}
                    className="border px-2 sm:px-3 md:px-4 py-1 sm:py-2 md:py-3 cursor-pointer select-none text-left whitespace-normal break-words leading-tight"
                    onClick={() => onSort(key)}
                >
                    <div className="flex flex-col items-start">
                        <span>{label}</span>
                        {sortedField === key ? (
                            ascending ? <ArrowUpIcon className="w-3 sm:w-4 md:w-5 h-3 sm:h-4 md:h-5 mt-1" /> : <ArrowDownIcon className="w-3 sm:w-4 md:w-5 h-3 sm:h-4 md:h-5 mt-1" />
                        ) : null}
                    </div>
                </th>
            ))}
        </tr>
    );
}