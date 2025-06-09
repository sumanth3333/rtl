"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useEmployee } from "@/hooks/useEmployee";
import { getEmployeeTargets, getPendingTodosCount, getStoreTargets } from "@/services/employee/employeeService";
import WelcomeSection from "@/components/employee/WelcomeSection";
import TargetSummary from "@/components/employee/TargetSummary";
import ReminderSummary from "@/components/employee/ReminderSummary";

export default function EmployeeDashboard() {
    const { role, isLoading } = useAuth();
    const { employee, store } = useEmployee();
    const [storeTargets, setStoreTargets] = useState(null);
    const [employeeTargets, setEmployeeTargets] = useState(null);
    const [pendingTodos, setPendingTodos] = useState(0);

    useEffect(() => {
        if (store?.dealerStoreId) {
            getStoreTargets(store.dealerStoreId).then(setStoreTargets);
            getPendingTodosCount(store.dealerStoreId)
                .then((count) => setPendingTodos(count))
                .catch((error) => console.error("Failed to fetch pending todos:", error));
        }
        if (employee?.employeeNtid) {
            getEmployeeTargets(employee.employeeNtid).then(setEmployeeTargets);
        }
    }, [store, employee]);

    if (isLoading || role === undefined) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-gray-500 text-lg animate-pulse">Loading dashboard...</p>
            </div>
        );
    }

    if (!role) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-gray-500 text-lg">Please log in to access the dashboard.</p>
            </div>
        );
    }

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-6 py-6 space-y-6">
            <WelcomeSection
                employee={employee}
                store={store}
                pendingTodos={pendingTodos}
            />
            <ReminderSummary />
            <section className="grid grid-cols-1 gap-6">
                <TargetSummary
                    title="📊 Store Target Progress"
                    targetData={storeTargets}
                    isEmployee={false}
                    cardStyle="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition duration-300"
                    textStyle="text-lg font-semibold text-gray-800 dark:text-gray-200"
                    highlightStyle="text-2xl font-bold text-blue-600 dark:text-blue-400"
                />
                <TargetSummary
                    title="🎯 Your Personal Targets"
                    targetData={employeeTargets}
                    isEmployee={true}
                    cardStyle="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition duration-300"
                    textStyle="text-lg font-semibold text-gray-800 dark:text-gray-200"
                    highlightStyle="text-2xl font-bold text-green-600 dark:text-green-400"
                />
            </section>
        </main>
    );
}
