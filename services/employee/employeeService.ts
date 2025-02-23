import { EodReport } from "@/types/employeeSchema";
import apiClient from "../api/apiClient";
import { Todo } from "@/types/todos";

export const clockInEmployee = async (employeeNtid: string, dealerStoreId: string) => {
    try {
        const response = await apiClient.post(`/employee/clockin`, {
            employeeNtid,
            dealerStoreId,
        });

        console.log("✅ Clock-in response:", response.data);
        return response.data || {}; // Ensure data is always returned
    } catch (error) {
        console.error("❌ Error clocking in:", error);
        return { error: "An error occurred during clock-in." }; // Return an error object instead of throwing
    }
};


export const submitEodReport = async (data: EodReport) => {
    try {
        const response = await apiClient.post("/sale/saveSaleDetails", data);
        console.log("✅ EOD Report Submitted Successfully:", response.data);
        return response.data; // Return the API response if needed
    } catch (error: unknown) {
        let errorMessage = "An unknown error occurred";

        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === "string") {
            errorMessage = error;
        } else if (error && typeof error === "object" && "response" in error) {
            errorMessage =
                (error as any).response?.data?.message || "API request failed";
        }

        console.error("❌ Failed to Submit EOD Report:", errorMessage);
        throw new Error(errorMessage); // Re-throw error for UI handling
    }
};

export const fetchTodos = async (storeId: string) => {
    try {
        const response = await apiClient.get(`/todos/getAssinedTodos?dealerStoreId=${storeId}`);
        if (response.data && Array.isArray(response.data.todos)) {
            return response.data;
        } else {
            console.error("Invalid response format", response.data);
            return { todos: [] }; // ✅ Ensure a fallback empty array
        }
    } catch (error) {
        console.error("API Error fetching todos:", error);
        return { todos: [] }; // ✅ Prevent crash by returning empty array
    }
};


export const updateTodoStatus = async (todoId: number, newStatus: boolean, employeeNtid: string): Promise<Todo> => {
    try {
        const response = await apiClient.put<Todo>("/todos/updateStatus", {
            id: todoId,
            completed: newStatus,
            employeeNtid: employeeNtid,
        });
        return response.data;
    } catch (error: unknown) {
        console.error("❌ API Update Error:", error);
        throw new Error("Failed to update todo status.");
    }
};

export const getAuthorizedStoresAPI = async (employeeNtid: string) => {
    const url = `/employee/authorizedStores/${employeeNtid}`;
    try {
        const response = await apiClient.get(url);

        if (!response.data || typeof response.data !== "object" || !Array.isArray(response.data.stores)) {
            throw new Error("Invalid response format from API.");
        }

        console.log(`✅ Authorized Stores:`, response.data.stores);
        return response.data; // Returns the full response containing `stores`
    } catch (error: any) {
        console.error("❌ Error fetching authorized stores:", error);
        throw error.response?.data || "An error occurred while fetching stores.";
    }
};