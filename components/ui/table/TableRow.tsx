import Button from "../Button";

interface TableRowProps<T> {
    item: T;
    columns: { key: keyof T; label: string }[];
    onEdit: (item: T) => void;
    onDelete: (id: string) => void;
    managers?: { id: string; name: string }[];
}

export default function TableRow<T extends Record<string, any>>({
    item,
    columns,
    onEdit,
    onDelete,
    managers = [],
}: TableRowProps<T>) {
    console.log(item);
    return (
        <tr className="hover:bg-gray-100 dark:hover:bg-gray-800 transition duration-200">
            {columns.map((col) => (
                <td key={String(col.key)} className="py-4 px-6 text-left">
                    {col.key === "manager" ? (
                        <select className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" defaultValue={item[col.key]}>
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
                <Button onClick={() => onEdit(item)} variant="primary">Update</Button>
                <Button onClick={() => onDelete(item.employeeNtid)} variant="danger">Deactivate</Button>
            </td>
        </tr>
    );
}
