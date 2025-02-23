"use client";

import TodosList from "@/components/employee/todos/TodoList";
import { useEmployee } from "@/hooks/useEmployee";
import useFetchTodos from "@/hooks/useFetchTodos";
import useUpdateTodoStatus from "@/hooks/useUpdateTodoStatus";
import { useEffect, useState } from "react";

export default function TodosPage() {
    const { store } = useEmployee();
    const [storeId, setStoreId] = useState<string | null>(null);

    // ✅ Wait for store data to be available before setting storeId
    useEffect(() => {
        if (store?.dealerStoreId) {
            console.log("Store ID Loaded:", store.dealerStoreId);
            setStoreId(store.dealerStoreId);
        }
    }, [store]);

    // ✅ Fetch todos only when storeId is available
    const { todos = [], setTodos, loading } = useFetchTodos(storeId ?? "");
    const { updateStatus } = useUpdateTodoStatus(setTodos);

    useEffect(() => {
        console.log("Store Updated:", store);
        console.log("Todos Updated:", todos);
    }, [store, todos]);

    return (
        <main className="w-full min-h-screen px-6 sm:px-10 md:px-16 lg:px-32 py-10 md:py-14 
            bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-200 transition-all duration-300 flex flex-col items-center">

            {/* ✅ Page Title */}
            <h1 className="text-3xl sm:text-4xl font-bold text-center tracking-tight mb-8">
                Employee Task Manager
            </h1>

            {/* ✅ Main Content (No "Card-on-Card" Effect) */}
            <section className="w-full max-w-4xl">
                {/* ✅ Loading State */}
                {!storeId ? (
                    <p className="text-gray-500 text-center text-lg">Loading store data...</p>
                ) : loading ? (
                    <p className="text-gray-500 text-center text-lg">Loading tasks...</p>
                ) : (
                    <TodosList todos={todos} onStatusChange={updateStatus} />
                )}
            </section>
        </main>
    );
}
