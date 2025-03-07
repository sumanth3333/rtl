interface TodoListProps {
    todos: string[];
}

export default function TodoList({ todos }: TodoListProps) {
    return (
        <ul className="mt-3 text-sm text-gray-600 dark:text-gray-300">
            {todos.map((todo, index) => (
                <li key={index} className="flex justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded-md mt-1">
                    {todo}
                </li>
            ))}
        </ul>
    );
}