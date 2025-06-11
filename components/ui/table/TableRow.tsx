import Button from "../Button";

interface TableRowProps<T> {
    item: T;
    columns: { key: keyof T; label: string }[];
    onEdit: (item: T) => void;
    onDelete: (id: string) => void;
    renderActions?: (item: T) => React.ReactNode; // ✅ Optional custom actions
    managers?: { id: string; name: string }[];
}

export default function TableRow<T extends Record<string, any>>({
    item,
    columns,
    onEdit,
    onDelete,
    renderActions,
    managers = [],
}: TableRowProps<T>) {
    return (
        <tr className="hover:bg-gray-100 dark:hover:bg-gray-800 transition duration-200">
            {columns.map((col) => (
                <td key={String(col.key)} className="py-4 px-6 text-left">
                    {col.key === "manager" ? (
                        <select
                            className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                            defaultValue={item[col.key]}
                        >
                            <option value="">Select Manager</option>
                            {managers.map((manager) => (
                                <option key={manager.id} value={manager.id}>
                                    {manager.name}
                                </option>
                            ))}
                        </select>
                    ) : (
                        String(item[col.key])
                    )}
                </td>
            ))}
            <td className="py-4 px-6 flex justify-center space-x-2">
                {renderActions ? (
                    renderActions(item) // ✅ Custom buttons from parent
                ) : (
                    <>
                        <Button onClick={() => onEdit(item)} variant="primary">Update</Button>
                        <Button
                            onClick={() =>
                                onDelete((item as any).employeeNtid || (item as any).dealerStoreId)
                            }
                            variant="danger"
                        >
                            Deactivate
                        </Button>
                    </>
                )}
            </td>
        </tr>
    );
}
