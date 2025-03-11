import { AssignedTodo } from "@/types/todosTypes";

interface AssignedTodosListProps {
    storeId: string;
    todos: AssignedTodo[];
}

export default function AssignedTodosList({ storeId, todos }: AssignedTodosListProps) {
    return (
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{storeId}</h3>
            {todos.length > 0 ? (
                <ul className="mt-2 space-y-2">
                    {todos.map((todo) => (
                        <li key={todo.id} className="flex items-center justify-between border-b py-2">
                            <span className={`${todo.completed ? "line-through text-gray-500" : "text-gray-800 dark:text-gray-100"}`}>
                                {todo.todoDescription}
                            </span>
                            <span className={`text-sm font-semibold ${todo.completed ? "text-green-500" : "text-red-500"}`}>
                                {todo.completed ? "Completed" : "Pending"}
                            </span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500">No assigned todos for this store.</p>
            )}
        </div>
    );
}