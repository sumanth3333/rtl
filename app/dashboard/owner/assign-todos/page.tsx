"use client";

import { useEffect, useState } from "react";
import { Store } from "@/types/todosTypes";
import Button from "@/components/ui/Button";
import { toast } from "react-toastify";
import { getStores } from "@/services/owner/ownerService";
import { assignTodosToStore } from "@/services/owner/todosService";
import StoreSelector from "@/components/owner/todos/StoreSelector";
import AssignTodosTable from "@/components/owner/todos/AssignTodosTable";
import { useOwner } from "@/hooks/useOwner";
import TodosInput from "@/components/owner/todos/TodosInput";

export default function AssignTodos() {
    const [stores, setStores] = useState<Store[]>([]);
    const [selectedStores, setSelectedStores] = useState<string[]>([]);
    const [todos, setTodos] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const { companyName } = useOwner();

    // ✅ Fetch stores on mount
    useEffect(() => {
        async function fetchStores() {
            const storesList = await getStores(companyName);
            setStores(storesList);
        }
        fetchStores();
    }, [companyName]);

    // ✅ Handle Todo Assignment
    const handleAssignTodos = async () => {
        if (selectedStores.length === 0 || todos.length === 0) {
            toast.error("Please select a store and add at least one ToDo.");
            return;
        }

        setLoading(true);
        try {
            await Promise.all(
                selectedStores.map((storeId) => assignTodosToStore({ dealerStoreId: storeId, todos }))
            );
            toast.success("ToDos assigned successfully!");
            setTodos([]); // Clear todos after assignment
        } catch (error) {
            toast.error("Failed to assign ToDos.");
            console.error(error);
        }
        setLoading(false);
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Assign ToDos</h1>

            {/* ✅ Store Selection */}
            <StoreSelector stores={stores} selectedStores={selectedStores} setSelectedStores={setSelectedStores} />

            {/* ✅ Add ToDos */}
            <TodosInput todos={todos} setTodos={setTodos} />

            {/* ✅ Display Assigned Todos */}
            <AssignTodosTable selectedStores={selectedStores} todos={todos} />

            {/* ✅ Submit Button */}
            <div className="flex justify-end">
                <Button onClick={handleAssignTodos} isLoading={loading} variant="primary">
                    Assign ToDos
                </Button>
            </div>
        </div>
    );
}