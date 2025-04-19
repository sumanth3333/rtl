// ✅ Store Type
export interface Store {
    dealerStoreId: string;
    storeName: string;
}

export interface Employee {
    employeeName: string;
    employeeNtid: string;
}
// ✅ Assign Todos Request Format
export interface AssignTodosRequest {
    dealerStoreId: string;
    todos: string[];
    scheduledDate: string;
}

export interface AssignedTodo {
    id: number;
    completed: boolean;
    todoDescription: string;
}

export interface AssignTodosResponse {
    todos: AssignedTodo[];
    workingEmployee: Employee | null;
}