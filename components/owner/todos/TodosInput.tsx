import { useState } from "react";
import Button from "@/components/ui/Button";

interface TodoInputProps {
    todos: string[];
    setTodos: (todos: string[]) => void;
}

export default function TodosInput({ todos, setTodos }: TodoInputProps) {
    const [newTodo, setNewTodo] = useState("");

    const addTodo = () => {
        if (newTodo.trim() !== "") {
            setTodos([...todos, newTodo.trim()]);
            setNewTodo("");
        }
    };

    return (
        <div className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Add ToDos</h3>
            <div className="flex space-x-2">
                <input
                    type="text"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    placeholder="Enter a ToDo"
                    className="flex-1 p-2 border rounded-lg dark:bg-gray-800 dark:text-white"
                />
                <Button onClick={addTodo} variant="primary">
                    Add
                </Button>
            </div>

            {/* ✅ Display added todos */}
            <ul className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                {todos.map((todo, index) => (
                    <li key={index} className="flex justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded-md mt-1">
                        {todo}
                    </li>
                ))}
            </ul>
        </div>
    );
}