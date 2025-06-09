"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/services/api/apiClient";
import { useEmployee } from "@/hooks/useEmployee";

interface Remainder {
    id: number;
    customerName: string;
    remainderMessage: string;
    contact: string;
    followupDate: string;
    postedDate: string;
}

export default function ReminderSummary() {
    const { store } = useEmployee();
    const [reminders, setReminders] = useState<Remainder[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchReminders = async () => {
            if (!store?.dealerStoreId) { return };
            setLoading(true);
            try {
                const res = await apiClient.get("/remainder/fetchRemainderForStore", {
                    params: { dealerStoreId: store.dealerStoreId },
                });
                const today = new Date().toISOString().split("T")[0];
                const allReminders = res.data?.flatMap((entry: any) => entry.remainders || []) || [];
                const todaysReminders = allReminders.filter((r: Remainder) => r.followupDate === today);
                setReminders(todaysReminders);
            } catch (error) {
                console.error("Failed to fetch reminders", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReminders();
    }, [store]);

    return (
        <section
            className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition duration-300"
        >
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    📅 Today's Follow-ups
                </h2>
                <button
                    onClick={() => router.push("/dashboard/employee/remainders")}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                    View All
                </button>
            </div>

            {loading ? (
                <p className="text-sm text-gray-500">Loading reminders...</p>
            ) : reminders.length === 0 ? (
                <p className="text-sm text-gray-500">No follow-ups scheduled for today.</p>
            ) : (
                <ul className="space-y-4">
                    {reminders.slice(0, 3).map((reminder) => (
                        <li
                            key={reminder.id}
                            className="cursor-pointer border-b pb-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition px-2"
                            onClick={() => router.push("/dashboard/employee/remainders")}
                        >
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {reminder.customerName} — {formatPhone(reminder.contact)}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                {reminder.remainderMessage}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">Follow-up: {reminder.followupDate}</p>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

function formatPhone(phone: string) {
    return phone.length === 10
        ? `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`
        : phone;
}
