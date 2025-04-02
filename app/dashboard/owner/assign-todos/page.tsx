"use client";

import { useEffect, useState } from "react";
import { Store, AssignedTodo } from "@/types/todosTypes";
import Button from "@/components/ui/Button";
import { toast } from "react-toastify";
import { getStores, getAssignedTodosForStore, getAssignedTodosForStoreByDate } from "@/services/owner/ownerService";
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
    const [scheduledDate, setScheduledDate] = useState(() => new Date().toISOString().split("T")[0]);


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
                    const data = await getAssignedTodosForStoreByDate(storeId, scheduledDate);
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
    }, [selectedStores, scheduledDate]);

    const handleAssignTodos = async () => {
        if (selectedStores.length === 0 || todos.length === 0) {
            toast.error("Please select a store and add at least one ToDo.");
            return;
        }

        setLoading(true);
        try {
            await Promise.all(
                selectedStores.map((storeId) =>
                    assignTodosToStore({
                        dealerStoreId: storeId,
                        todos,
                        scheduledDate,
                    })
                )
            );

            toast.success("ToDos assigned successfully! You can assign same todos for another day, Simply change the date and hit assign todos.");

            // ✅ Fetch updated assigned todos immediately
            const updatedAssignedTodos: Record<string, AssignedTodo[]> = {};
            for (const storeId of selectedStores) {
                try {
                    const response = await getAssignedTodosForStoreByDate(storeId, scheduledDate);
                    updatedAssignedTodos[storeId] = response.todos;
                } catch (error) {
                    console.error(`❌ Error fetching updated todos for store ${storeId}:`, error);
                    updatedAssignedTodos[storeId] = [];
                }
            }
            setAssignedTodos(updatedAssignedTodos);
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
            <input
                type="date"
                className="w-full sm:w-64 px-4 py-2 border rounded-md dark:bg-gray-800 dark:text-white"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
            />

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
