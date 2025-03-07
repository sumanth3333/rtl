interface AssignTodosTableProps {
    selectedStores: string[];
    todos: string[];
}

export default function AssignTodosTable({ selectedStores, todos }: AssignTodosTableProps) {
    return (
        <div className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Assigned ToDos</h3>
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-700 text-white">
                    <tr>
                        <th className="p-3">Store</th>
                        <th className="p-3">ToDos</th>
                    </tr>
                </thead>
                <tbody>
                    {selectedStores.map((storeId, index) => (
                        <tr key={index} className="border-t">
                            <td className="p-3">{storeId}</td>
                            <td className="p-3">{todos.join(", ") || "No ToDos Assigned"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}