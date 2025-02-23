import { Todo } from "@/types/todos";

interface TodosItemProps {
    todo: Todo;
    onStatusChange: (id: number, newStatus: boolean) => void;
}

export default function TodosItem({ todo, onStatusChange }: TodosItemProps) {
    return (
        <div
            className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 rounded-xl shadow-md border transition-all duration-300 cursor-pointer transform
            ${todo.completed
                    ? "bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800 border-gray-500 dark:border-gray-600 text-gray-700 dark:text-gray-300 opacity-80"
                    : "bg-gradient-to-r from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 border-gray-300 dark:border-gray-700 hover:shadow-lg hover:scale-[1.02]"
                }`}
        >
            {/* ✅ Checkbox & Task Text (Auto-wrap for long todos) */}
            <label className="flex items-start sm:items-center gap-3 sm:gap-4 w-full cursor-pointer">
                {/* ✅ Custom Checkbox (Auto-Scales) */}
                <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => onStatusChange(todo.id, !todo.completed)}
                    className="peer hidden"
                />
                <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center border-2 border-gray-500 dark:border-gray-400 rounded-md transition-all duration-300
                    peer-checked:border-green-500 dark:peer-checked:border-green-400 peer-checked:bg-green-500 dark:peer-checked:bg-green-400 shadow-sm">
                    {todo.completed && (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                </div>

                {/* ✅ Task Text (Auto Wraps for Long Todos) */}
                <div className="flex flex-col">
                    <span className="text-sm sm:text-lg font-medium transition-all duration-300 peer-checked:text-gray-600 dark:peer-checked:text-gray-400 break-words">
                        {todo.todoDescription}
                    </span>

                    {/* ✅ Status Badge Moves Under Text on Small Screens */}
                    <span
                        className={`mt-2 sm:mt-0 sm:ml-4 px-2.5 py-1 text-xs sm:text-sm font-semibold uppercase rounded-full transition-all duration-300 self-start
                        ${todo.completed
                                ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200"
                                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200"}
                    `}
                    >
                        {todo.completed ? "Completed" : "Pending"}
                    </span>
                </div>
            </label>
        </div>
    );
}
