import { fetchTodos } from "@/services/employee/employeeService";
import { useState, useEffect } from "react";

interface Todo {
    id: number;
    todoDescription: string;
    completed: boolean;
}

const useFetchTodos = (storeId?: string) => {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!storeId) {
            console.warn("⏳ Waiting for store ID... Skipping API Call.");
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                console.log(`Fetching todos for store: ${storeId}`);
                const data = await fetchTodos(storeId);
                if (Array.isArray(data.todos)) {
                    setTodos(data.todos);
                } else {
                    console.error("Invalid API response:", data);
                    setTodos([]);
                }
            } catch (error) {
                console.error("Error fetching todos:", error);
                setTodos([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [storeId]);

    return { todos, setTodos, loading };
};

export default useFetchTodos;
