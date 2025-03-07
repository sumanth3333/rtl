
import { AssignTodosRequest } from "@/types/todosTypes";
import apiClient from "../api/apiClient";

// ✅ Assign ToDos to a specific store
export const assignTodosToStore = async (request: AssignTodosRequest) => {
    try {
        const response = await apiClient.post(`/todos/assignTodosToStore`, request);
        return response.data;
    } catch (error) {
        console.error("❌ Error assigning ToDos:", error);
        throw error;
    }
};