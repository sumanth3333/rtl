import TodosItem from "./TodoItem";

interface Todo {
    id: number;
    todoDescription: string;
    completed: boolean;
}

interface TodosListProps {
    todos?: Todo[];
    onStatusChange: (id: number, newStatus: boolean) => void;
}

export default function TodosList({ todos = [], onStatusChange }: TodosListProps) {
    const pendingTodos = todos.filter((todo) => !todo.completed);
    const completedTodos = todos.filter((todo) => todo.completed);

    return (
        <div className="w-full max-w-2xl mx-auto p-4 md:p-6 space-y-8">
            <Section title="Pending Tasks" todos={pendingTodos} onStatusChange={onStatusChange} />
            <Section title="Completed Tasks" todos={completedTodos} onStatusChange={onStatusChange} />
        </div>
    );
}

function Section({ title, todos = [], onStatusChange }: TodosListProps & { title: string }) {
    return (
        <div className="w-full">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-300 mb-4 border-b-2 border-gray-300 dark:border-gray-700 pb-2">
                {title}
            </h2>
            {todos.length > 0 ? (
                <ul className="space-y-4">
                    {todos.map((todo) => (
                        <li key={todo.id}>
                            <TodosItem todo={todo} onStatusChange={onStatusChange} />
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 italic">
                    No {title.toLowerCase()}.
                </p>
            )}
        </div>
    );
}
