// ✅ Store Type
export interface Store {
    dealerStoreId: string;
    storeName: string;
}

// ✅ Assign Todos Request Format
export interface AssignTodosRequest {
    dealerStoreId: string;
    todos: string[];
}

export interface AssignedTodo {
    id: number;
    completed: boolean;
    todoDescription: string;
}