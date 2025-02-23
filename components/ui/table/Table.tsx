import TableRow from "./TableRow";

interface TableProps<T extends Record<string, any>> {
    data: T[] | undefined;
    columns: { key: keyof T; label: string }[];
    onEdit: (item: T) => void;
    onDelete: (id: string) => void;
    managers?: { id: string; name: string }[];
}

export default function Table<T extends Record<string, any>>({
    data = [],
    columns,
    onEdit,
    onDelete,
    managers = [],
}: TableProps<T>) {
    if (!Array.isArray(data)) {
        console.error("🚨 Table data is not an array:", data);
        return <p className="text-red-500 text-center">Error: Data is not available</p>;
    }

    return (
        <div className="w-full overflow-x-auto rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <table className="w-full min-w-[600px] border-collapse bg-white dark:bg-gray-900 dark:text-gray-200">
                {/* 🔹 Sticky Header for Large Datasets */}
                <thead className="sticky top-0 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 uppercase text-sm tracking-wide">
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={String(col.key)}
                                className="py-4 px-4 text-left font-medium whitespace-nowrap"
                            >
                                {col.label}
                            </th>
                        ))}
                        <th className="py-4 px-4 text-center font-medium">Actions</th>
                    </tr>
                </thead>

                {/* 🔹 Table Body */}
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {data.length > 0 ? (
                        data.map((item, index) => (
                            <TableRow
                                key={index}
                                item={item}
                                columns={columns}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                managers={managers}
                            />
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan={columns.length + 1}
                                className="py-6 text-center text-gray-500 dark:text-gray-400"
                            >
                                No records available.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
