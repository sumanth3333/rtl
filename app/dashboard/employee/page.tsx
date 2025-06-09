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
    const { employee, store, isClockin } = useEmployee();
    const [storeTargets, setStoreTargets] = useState(null);
    const [employeeTargets, setEmployeeTargets] = useState(null);
    const [pendingTodos, setPendingTodos] = useState(0);
    const [showClockinReminder, setShowClockinReminder] = useState(false);

    useEffect(() => {

    }, [employee, store, isClockin]);

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

        if (
            employee?.employeeNtid &&
            store?.dealerStoreId &&
            isClockin !== undefined && // ✅ wait until it's defined
            isClockin === false
        ) {
            setShowClockinReminder(true);
        }
    }, [store, employee, isClockin]);

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
        <>{
            showClockinReminder && isClockin === false && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 px-4">
                    <div className="w-full max-w-xl bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl border border-gray-300 dark:border-gray-700">
                        <h2 className="text-lg sm:text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-4">
                            Please Confirm Your Store and Clock In
                        </h2>
                        <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-200 list-disc pl-5">
                            <li>Make sure the logged-in store is correct: <strong>{store?.storeName}</strong>.</li>
                            <li>If it’s correct, please <strong>clock in</strong> to begin your shift.</li>
                            <li>After clocking in, go to the <strong>Inventory</strong> page and update stock levels if needed.</li>
                        </ul>
                        <div className="flex justify-end mt-6">
                            <button
                                onClick={() => setShowClockinReminder(false)}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                            >
                                Got It
                            </button>
                        </div>
                    </div>
                </div>
            )
        }
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
        </>
    );
}
