
import { updateTodoStatus } from "@/services/employee/employeeService";
import { useEmployee } from "./useEmployee";
import { Todo } from "@/types/todos";

interface UpdateTodoHook {
    updateStatus: (todoId: number, newStatus: boolean) => void;
}

export default function useUpdateTodoStatus(setTodos: React.Dispatch<React.SetStateAction<Todo[]>>): UpdateTodoHook {
    const { employee } = useEmployee();
    const employeeNtid = employee?.employeeNtid || "";
    const updateStatus = async (todoId: number, newStatus: boolean) => {
        try {
            await updateTodoStatus(todoId, newStatus, employeeNtid);
            setTodos((prev) =>
                prev.map((todo) =>
                    todo.id === todoId ? { ...todo, completed: newStatus } : todo
                )
            );
        } catch (error) {
            console.error("Failed to update todo status:", error);
        }
    };
    return { updateStatus };
}
