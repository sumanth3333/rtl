"use client";

import { useEffect, useState } from "react";
import { Store, AssignedTodo } from "@/types/todosTypes";
import Button from "@/components/ui/Button";
import { toast } from "react-toastify";
import { getStores, getAssignedTodosForStore } from "@/services/owner/ownerService";
import { assignTodosToStore } from "@/services/owner/todosService";
import StoreSelector from "@/components/owner/todos/StoreSelector";
import TodoInput from "@/components/owner/todos/TodosInput";
import AssignedTodosList from "@/components/owner/todos/AssignedTodosList";
import { useOwner } from "@/hooks/useOwner";

export default function AssignTodos() {
    const [stores, setStores] = useState<Store[]>([]);
    const [selectedStores, setSelectedStores] = useState<string[]>([]);
    const [todos, setTodos] = useState<string[]>([]);
    const [assignedTodos, setAssignedTodos] = useState<Record<string, AssignedTodo[]>>({});
    const [loading, setLoading] = useState(false);
    const { companyName } = useOwner();

    // ✅ Fetch stores on mount and select all stores by default
    useEffect(() => {
        if (!companyName) {
            return;
        }
        async function fetchStores() {
            const storesList = await getStores(companyName);
            setStores(storesList);
            setSelectedStores(storesList.map(store => store.dealerStoreId)); // Auto-select all stores
        }
        fetchStores();
    }, [companyName]);

    // ✅ Fetch Assigned Todos for Selected Stores
    useEffect(() => {
        async function fetchAssignedTodos() {
            const assignedTodosMap: Record<string, AssignedTodo[]> = {};
            for (const storeId of selectedStores) {
                try {
                    const data = await getAssignedTodosForStore(storeId);
                    assignedTodosMap[storeId] = data.todos;
                } catch (error) {
                    console.error(`❌ Error fetching assigned todos for store ${storeId}:`, error);
                    assignedTodosMap[storeId] = [];
                }
            }
            setAssignedTodos(assignedTodosMap);
        }

        if (selectedStores.length > 0) {
            fetchAssignedTodos();
        }
    }, [selectedStores]);

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
            toast.success("✅ ToDos assigned successfully!");
            setTodos([]); // Clear todos after assignment

            setTimeout(() => {
                window.location.reload(); // ✅ Refresh the page after success
            }, 1500);
        } catch (error) {
            toast.error("❌ Failed to assign ToDos.");
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
            <TodoInput todos={todos} setTodos={setTodos} />

            {/* ✅ Submit Button */}
            <div className="flex justify-center">
                <Button onClick={handleAssignTodos} isLoading={loading} variant="primary">
                    Assign ToDos
                </Button>
            </div>

            {/* ✅ Display Assigned Todos */}
            {selectedStores.map((storeId) => (
                <AssignedTodosList key={storeId} storeId={storeId} todos={assignedTodos[storeId] || []} />
            ))}


        </div>
    );
}
